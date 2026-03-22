// ─── LiquidX — Global Identity Store ─────────────────────────────────────────
// Single source of truth for wallet address + DID state.
// Persisted to localStorage so state survives page refreshes and browser restarts.
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
  verifyDIDDocument,
  createUserDID,
  formatDID,
  type UserIdentity,
  type DIDVerificationResult,
  type DIDDocument,
} from "@/lib/did";
import { createClient } from "@/lib/supabase/client";

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
  saveToSupabase: (userId: string) => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
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

        // Save address to Supabase immediately — don't wait for DID resolution
        // so the profile is always up to date even if DID fails.
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").upsert({
            id: user.id,
            xrpl_address: trimmed,
            updated_at: new Date().toISOString(),
          });
        }

        try {
          // Resolve via server API — avoids browser WebSocket timeouts/blocks.
          const res = await fetch(`/api/xrpl/did/resolve?address=${encodeURIComponent(trimmed)}`);
          const data = await res.json();

          const did = createUserDID(trimmed);
          const rawDoc = (data.document ?? null) as DIDDocument | null;
          const v = verifyDIDDocument(did, rawDoc);

          const id: UserIdentity = {
            xrplAddress: trimmed,
            did,
            didVerified: v.valid,
            didDocument: v.document,
            verificationStatus: v.valid ? "verified" : (rawDoc ? "rejected" : "unverified"),
            trustLevel: v.trustLevel,
            kycProvider: v.kycProvider,
            kycVerifiedAt: v.kycVerifiedAt,
            jurisdiction: v.jurisdiction,
          };

          set({ identity: id, verification: v, didLoading: false });

          // Update Supabase with full DID info now that resolution succeeded
          if (user) {
            await get().saveToSupabase(user.id);
          }
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

      // ── saveToSupabase ─────────────────────────────────────────────────────
      // Upserts the current identity into the profiles table.
      saveToSupabase: async (userId: string) => {
        const { xrplAddress, identity } = get();
        if (!xrplAddress) return;
        const supabase = createClient();
        await supabase.from("profiles").upsert({
          id: userId,
          xrpl_address: xrplAddress,
          did_verified: identity?.didVerified ?? false,
          trust_level: identity?.trustLevel ?? "low",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          did_document: (identity?.didDocument as any) ?? null,
          updated_at: new Date().toISOString(),
        });
      },

      // ── loadFromSupabase ───────────────────────────────────────────────────
      // Fetches the profile for userId and hydrates the store.
      // Skips if there's already a wallet linked (localStorage cache is fresh).
      loadFromSupabase: async (userId: string) => {
        // If localStorage already has a linked wallet, trust it — no round-trip needed
        if (get().walletLinked) return;

        const supabase = createClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("xrpl_address, did_verified, trust_level, did_document")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("[Identity] loadFromSupabase error:", error.message);
          return;
        }
        if (!data?.xrpl_address) return;

        // Restore state from DB without re-resolving DID (faster load)
        set({
          xrplAddress: data.xrpl_address,
          walletLinked: true,
          identity: {
            xrplAddress: data.xrpl_address,
            did: createUserDID(data.xrpl_address),
            didVerified: data.did_verified ?? false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            didDocument: (data.did_document as any) ?? undefined,
            verificationStatus: data.did_verified ? "verified" : "unverified",
            trustLevel: (data.trust_level as "low" | "medium" | "high") ?? "low",
          },
          didLoading: false,
          didError: "",
        });
      },
    }),
    {
      name: "liquidx-identity-v1",
      storage: createJSONStorage(() => localStorage),
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
