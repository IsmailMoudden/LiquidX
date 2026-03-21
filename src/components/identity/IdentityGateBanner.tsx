"use client";

// ─── IdentityGateBanner ───────────────────────────────────────────────────────
// Shown at the top of any page that requires a verified DID.
// Handles all three blocked states: no wallet, DID loading, DID invalid.

import Link from "next/link";
import { Wallet, Loader2, ShieldCheck, AlertTriangle, ChevronRight, User } from "lucide-react";
import type { IdentityGateStatus } from "@/store/identity-store";

interface Props {
  status: IdentityGateStatus;
  action?: string; // e.g. "register assets", "request a loan", "lend"
}

export function IdentityGateBanner({ status, action = "perform this action" }: Props) {
  if (status === "ready") return null;

  if (status === "no-wallet") {
    return (
      <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15 shrink-0">
            <Wallet className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white mb-1">Connect your XRPL wallet first</p>
            <p className="text-sm text-white/50 mb-4">
              You need to link your XRPL address and verify your identity before
              you can {action}.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors"
            >
              <User className="h-4 w-4" />
              Connect wallet in Account
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "did-loading") {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/2 p-5 mb-6 flex items-center gap-4">
        <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
        <p className="text-sm text-white/50">Verifying your identity on XRPL…</p>
      </div>
    );
  }

  // did-unverified
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white mb-1">Identity not verified</p>
          <p className="text-sm text-white/50 mb-4">
            Your XRP DID could not be verified. Complete identity verification in
            your Account before you can {action}.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            Verify identity in Account
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── VerifiedIdentityPill ─────────────────────────────────────────────────────
// Small inline badge shown when identity IS verified.

export function VerifiedIdentityPill({ displayDid }: { displayDid: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 mb-6">
      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-emerald-400">Identity verified</p>
        <p className="font-mono text-[10px] text-white/30 truncate mt-0.5">{displayDid}</p>
      </div>
      <Link href="/account" className="text-[10px] text-white/30 hover:text-white/60 shrink-0">
        Manage →
      </Link>
    </div>
  );
}
