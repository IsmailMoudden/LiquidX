// ─── LiquidX — XRPL DID Integration ──────────────────────────────────────────
// Real DID resolution using did-resolver + xrpl-did-resolver.
// Every user who wants to tokenize or borrow must hold a verified DID.
//
// DID format:  did:xrpl:<r-address>
// Example:     did:xrpl:rNsD97gAPq9V3DRBfWkV32N6ihbF5oWBrD
//
// Resolution order:
//   1. On-chain DIDDocument field  (DIDSet tx on XRPL)
//   2. IPFS   ipfs://<CID>         (via Helia / public gateways)
//   3. HTTPS  https://…            (standard HTTP endpoint)

import { Resolver, type DIDResolutionResult } from "did-resolver";
import { getResolver as getXrplResolver } from "xrpl-did-resolver";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DIDVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

/** Verification level derived from DID document extensions */
export type DIDTrustLevel = "low" | "medium" | "high";

/** Subset of W3C DID document we actually care about */
export interface DIDDocument {
  "@context": string | string[];
  id: string;
  publicKey?: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyHex?: string;
    publicKeyBase58?: string;
  }>;
  verificationMethod?: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyHex?: string;
    publicKeyBase58?: string;
  }>;
  authentication?: string[];
  assertionMethod?: string[];
  // ── LiquidX extensions (optional, set by KYC providers) ──
  liquidx?: {
    kycProvider?: string;        // e.g. "Sumsub", "Jumio"
    kycVerifiedAt?: string;      // ISO timestamp
    trustLevel?: DIDTrustLevel;  // low | medium | high
    jurisdiction?: string;       // ISO 3166-1 alpha-2 country code
    verifierSignature?: string;  // provider signature over the DID
  };
}

/** Full identity record for a LiquidX user */
export interface UserIdentity {
  xrplAddress: string;
  did: string;                    // did:xrpl:<address>
  didVerified: boolean;
  didDocument?: DIDDocument;
  verificationStatus: DIDVerificationStatus;
  trustLevel?: DIDTrustLevel;
  kycProvider?: string;
  kycVerifiedAt?: string;
  jurisdiction?: string;
}

export interface DIDVerificationResult {
  valid: boolean;
  did: string;
  document?: DIDDocument;
  trustLevel: DIDTrustLevel;
  errors: string[];
  // parsed fields for UI display
  publicKeyType?: string;
  hasKyc: boolean;
  kycProvider?: string;
  kycVerifiedAt?: string;
  jurisdiction?: string;
}

// ─── Resolver singleton ───────────────────────────────────────────────────────

let _resolver: Resolver | null = null;

function getResolver(): Resolver {
  if (!_resolver) {
    _resolver = new Resolver({ ...getXrplResolver() });
  }
  return _resolver;
}

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * createUserDID — derives a DID string from an XRPL r-address.
 * No network call needed — the DID is deterministic.
 */
export function createUserDID(xrplAddress: string): string {
  if (!xrplAddress.startsWith("r") || xrplAddress.length < 25) {
    throw new Error(`Invalid XRPL address: ${xrplAddress}`);
  }
  return `did:xrpl:${xrplAddress}`;
}

/**
 * resolveDID — fetches and returns the DID document from XRPL.
 * Supports on-chain DIDDocument, ipfs://<CID>, and https:// URIs.
 */
export async function resolveDID(did: string): Promise<DIDResolutionResult> {
  if (!did.startsWith("did:xrpl:")) {
    throw new Error(`Unsupported DID method: ${did}. Only did:xrpl: is supported.`);
  }
  const resolver = getResolver();
  const result = await resolver.resolve(did);
  return result;
}

/**
 * verifyDIDDocument — validates a resolved DID document.
 *
 * Checks:
 *  1. document.id matches the requested DID (prevents spoofed documents)
 *  2. at least one publicKey / verificationMethod of type Secp256k1
 *  3. authentication array is present
 *  4. assertionMethod array is present
 *  5. XRPL address in DID matches wallet address (anti-spoofing)
 *
 * Returns full verification result including trust level from optional
 * liquidx extension fields set by KYC providers.
 */
export function verifyDIDDocument(
  did: string,
  rawDoc: DIDDocument | null | undefined
): DIDVerificationResult {
  const errors: string[] = [];

  if (!rawDoc) {
    return {
      valid: false,
      did,
      trustLevel: "low",
      errors: ["DID document could not be resolved or does not exist."],
      hasKyc: false,
    };
  }

  // ── 1. ID matches ───────────────────────────────────────────────────────────
  if (rawDoc.id !== did) {
    errors.push(`Document id "${rawDoc.id}" does not match requested DID "${did}".`);
  }

  // ── 2. Public key present and valid type ────────────────────────────────────
  const keys = [...(rawDoc.publicKey ?? []), ...(rawDoc.verificationMethod ?? [])];
  if (keys.length === 0) {
    errors.push("No publicKey or verificationMethod found in DID document.");
  }
  const secp256k1Key = keys.find((k) =>
    k.type.toLowerCase().includes("secp256k1")
  );
  if (!secp256k1Key) {
    errors.push(
      `No Secp256k1 key found. Got types: ${keys.map((k) => k.type).join(", ") || "none"}`
    );
  }
  if (secp256k1Key?.publicKeyHex) {
    // Secp256k1 uncompressed public key is 65 bytes (130 hex chars)
    // Compressed is 33 bytes (66 hex chars)
    const len = secp256k1Key.publicKeyHex.length;
    if (len !== 66 && len !== 130) {
      errors.push(`publicKeyHex has unexpected length ${len} (expected 66 or 130).`);
    }
  }

  // ── 3. Authentication ───────────────────────────────────────────────────────
  if (!rawDoc.authentication || rawDoc.authentication.length === 0) {
    errors.push("DID document is missing 'authentication' array.");
  }

  // ── 4. AssertionMethod ──────────────────────────────────────────────────────
  if (!rawDoc.assertionMethod || rawDoc.assertionMethod.length === 0) {
    errors.push("DID document is missing 'assertionMethod' array.");
  }

  // ── 5. Address anti-spoofing: DID must embed the same address ───────────────
  const addressInDid = did.replace("did:xrpl:", "");
  if (rawDoc.id && !rawDoc.id.includes(addressInDid)) {
    errors.push("DID document id does not contain the expected XRPL address.");
  }

  // ── Trust level from optional liquidx extension fields ─────────────────────
  const ext = rawDoc.liquidx;
  let trustLevel: DIDTrustLevel = "low";
  if (ext?.trustLevel) {
    trustLevel = ext.trustLevel;
  } else if (ext?.kycProvider && ext?.kycVerifiedAt) {
    // KYC provider present without explicit level → treat as medium
    trustLevel = "medium";
  }

  return {
    valid: errors.length === 0,
    did,
    document: rawDoc,
    trustLevel,
    errors,
    publicKeyType: secp256k1Key?.type,
    hasKyc: !!ext?.kycProvider,
    kycProvider: ext?.kycProvider,
    kycVerifiedAt: ext?.kycVerifiedAt,
    jurisdiction: ext?.jurisdiction,
  };
}

/**
 * attachDIDToUser — resolves + verifies the DID for an XRPL address
 * and returns a complete UserIdentity object ready to store.
 */
export async function attachDIDToUser(
  xrplAddress: string,
  existingIdentity?: Partial<UserIdentity>
): Promise<UserIdentity> {
  const did = createUserDID(xrplAddress);

  try {
    const resolution = await resolveDID(did);
    const rawDoc = resolution.didDocument as DIDDocument | null | undefined;
    const verification = verifyDIDDocument(did, rawDoc);

    return {
      xrplAddress,
      did,
      didVerified: verification.valid,
      didDocument: verification.document,
      verificationStatus: verification.valid ? "verified" : "rejected",
      trustLevel: verification.trustLevel,
      kycProvider: verification.kycProvider ?? existingIdentity?.kycProvider,
      kycVerifiedAt: verification.kycVerifiedAt ?? existingIdentity?.kycVerifiedAt,
      jurisdiction: verification.jurisdiction ?? existingIdentity?.jurisdiction,
    };
  } catch (err) {
    console.warn("[DID] Resolution failed for", did, err);
    return {
      xrplAddress,
      did,
      didVerified: false,
      verificationStatus: "unverified",
      trustLevel: "low",
    };
  }
}

/**
 * requireVerifiedDID — enforcement gate used before tokenization / loan requests.
 * Throws a typed error with a user-friendly message if DID is not verified.
 */
export function requireVerifiedDID(
  identity: UserIdentity | null | undefined,
  action: "tokenize" | "borrow" = "tokenize"
): void {
  if (!identity?.didVerified) {
    throw new DIDNotVerifiedError(
      action === "tokenize"
        ? "You must verify your XRP DID before registering assets. Complete identity verification in your Account."
        : "You must verify your XRP DID before requesting a loan. Complete identity verification in your Account."
    );
  }
}

export class DIDNotVerifiedError extends Error {
  readonly code = "DID_NOT_VERIFIED";
  constructor(message: string) {
    super(message);
    this.name = "DIDNotVerifiedError";
  }
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

/**
 * formatDID — short display format: did:xrpl:rNsD9…BrD
 */
export function formatDID(did: string, chars = 5): string {
  const address = did.replace("did:xrpl:", "");
  if (address.length <= chars * 2) return did;
  return `did:xrpl:${address.slice(0, chars)}…${address.slice(-3)}`;
}

/** Maps UserIdentity to the 3 UI states shown in Account page */
export type DIDUIState = "not-connected" | "connected" | "verified";

export function getDIDUIState(identity: UserIdentity | null | undefined): DIDUIState {
  if (!identity?.xrplAddress) return "not-connected";
  if (identity.didVerified) return "verified";
  return "connected";
}
