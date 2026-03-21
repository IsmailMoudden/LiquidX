// ─── LiquidX — Global Identity Store ─────────────────────────────────────────
// Single source of truth for wallet address + DID state.
// Persisted to sessionStorage so state survives page navigation but clears
// when the browser tab is closed (appropriate for financial applications).
//
// Data flow:
//   User enters XRPL address (Account page)
//   → linkWallet(address)
//   → attachDIDToUser() resolves DID from XRPL
//   → identity + verification stored globally
//   → all pages read from this store

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  attachDIDToUser,
  resolveDID,
  verifyDIDDocument,
  createUserDID,
  formatDID,
  type UserIdentity,
  type DIDVerificationResult,
} from "@/lib/did";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IdentityState {
  // ── Wallet ──────────────────────────────────────────────────────────────────
  xrplAddress: string | null;
  walletLinked: boolean;

  // ── DID ─────────────────────────────────────────────────────────────────────
  identity: UserIdentity | null;
  verification: DIDVerificationResult | null;
  didLoading: boolean;
  didError: string;

  // ── Computed getters ─────────────────────────────────────────────────────────
  readonly did: string | null;           // did:xrpl:<address> or null
  readonly didVerified: boolean;         // true only if resolved + valid doc
  readonly displayDid: string | null;    // short format: did:xrpl:rNsD9…BrD

  // ── Actions ──────────────────────────────────────────────────────────────────
  linkWallet: (address: string) => Promise<void>;
  reResolveDID: () => Promise<void>;
  clearIdentity: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────────
      xrplAddress: null,
      walletLinked: false,
      identity: null,
      verification: null,
      didLoading: false,
      didError: "",

      // ── Computed (via getters on the object) ───────────────────────────────
      get did(): string | null {
        const addr = get().xrplAddress;
        return addr ? createUserDID(addr) : null;
      },
      get didVerified(): boolean {
        return get().identity?.didVerified === true;
      },
      get displayDid(): string | null {
        const did = get().did;
        return did ? formatDID(did) : null;
      },

      // ── linkWallet ─────────────────────────────────────────────────────────
      // Validates address, stores it, then immediately resolves the DID.
      linkWallet: async (address: string) => {
        const trimmed = address.trim();
        if (!trimmed.startsWith("r") || trimmed.length < 25) {
          set({ didError: "Invalid XRPL address. Must start with 'r' and be at least 25 characters." });
          return;
        }

        set({
          xrplAddress: trimmed,
          walletLinked: true,
          didLoading: true,
          didError: "",
          identity: null,
          verification: null,
        });

        try {
          const id = await attachDIDToUser(trimmed);
          // Run detailed verification pass
          const resolution = await resolveDID(id.did);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const v = verifyDIDDocument(id.did, resolution.didDocument as any);
          set({ identity: id, verification: v, didLoading: false });
        } catch (err) {
          set({
            didError: err instanceof Error ? err.message : "Failed to resolve DID.",
            didLoading: false,
          });
        }
      },

      // ── reResolveDID ───────────────────────────────────────────────────────
      // Re-fetches from XRPL without changing the address.
      reResolveDID: async () => {
        const { xrplAddress } = get();
        if (!xrplAddress) return;
        await get().linkWallet(xrplAddress);
      },

      // ── clearIdentity ──────────────────────────────────────────────────────
      clearIdentity: () =>
        set({
          xrplAddress: null,
          walletLinked: false,
          identity: null,
          verification: null,
          didLoading: false,
          didError: "",
        }),
    }),
    {
      name: "liquidx-identity-v1",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the data — not the async functions
      partialize: (state) => ({
        xrplAddress: state.xrplAddress,
        walletLinked: state.walletLinked,
        identity: state.identity,
        verification: state.verification,
      }),
    }
  )
);

// ─── Selector helpers (memoization-friendly) ─────────────────────────────────

export const selectWalletConnected = (s: IdentityState) => s.walletLinked;
export const selectDidVerified = (s: IdentityState) => s.identity?.didVerified === true;
export const selectXrplAddress = (s: IdentityState) => s.xrplAddress;
export const selectIdentity = (s: IdentityState) => s.identity;
export const selectVerification = (s: IdentityState) => s.verification;
export const selectDIDLoading = (s: IdentityState) => s.didLoading;
export const selectDIDError = (s: IdentityState) => s.didError;
export const selectDisplayDid = (s: IdentityState) =>
  s.xrplAddress ? formatDID(createUserDID(s.xrplAddress)) : null;

// ─── Gate hook ────────────────────────────────────────────────────────────────
// Use this in any page/component that needs to enforce wallet + DID.

export type IdentityGateStatus =
  | "ready"               // wallet linked + DID verified → allow action
  | "no-wallet"           // wallet not connected
  | "did-unverified"      // wallet linked but DID not verified or invalid
  | "did-loading";        // resolution in progress

export function useIdentityGate(): {
  status: IdentityGateStatus;
  xrplAddress: string | null;
  identity: UserIdentity | null;
  verification: DIDVerificationResult | null;
} {
  const xrplAddress = useIdentityStore(selectXrplAddress);
  const walletLinked = useIdentityStore(selectWalletConnected);
  const identity = useIdentityStore(selectIdentity);
  const verification = useIdentityStore(selectVerification);
  const didLoading = useIdentityStore(selectDIDLoading);

  let status: IdentityGateStatus = "ready";
  if (!walletLinked || !xrplAddress) status = "no-wallet";
  else if (didLoading) status = "did-loading";
  else if (!identity?.didVerified) status = "did-unverified";

  return { status, xrplAddress, identity, verification };
}
