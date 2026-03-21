"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDID } from "@/lib/did";
import {
  useIdentityStore,
  selectXrplAddress,
  selectIdentity,
  selectVerification,
  selectDIDLoading,
  selectDIDError,
  selectDisplayDid,
} from "@/store/identity-store";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  LogOut,
  Trash2,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  ShieldCheck,
  ExternalLink,
  Wallet,
  ChevronRight,
  Loader2,
  XCircle,
} from "lucide-react";
// unused imports removed after identity store migration

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess(false);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setProfileLoading(false);
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess(false);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordLoading(false);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (fullName || user?.email || "U")[0].toUpperCase();
  const isOAuthUser = !user?.email?.includes("@") || (user.app_metadata?.provider !== "email");

  // ── DID / Identity state — read from global identity store ──────────────
  const xrplAddressStored = useIdentityStore(selectXrplAddress);
  const identity = useIdentityStore(selectIdentity);
  const verification = useIdentityStore(selectVerification);
  const didLoading = useIdentityStore(selectDIDLoading);
  const didError = useIdentityStore(selectDIDError);
  const displayDid = useIdentityStore(selectDisplayDid);
  const linkWallet = useIdentityStore((s) => s.linkWallet);
  const reResolveDID = useIdentityStore((s) => s.reResolveDID);
  const clearIdentity = useIdentityStore((s) => s.clearIdentity);

  // Local input state (address entry only — not stored locally)
  const [walletAddress, setWalletAddress] = useState(xrplAddressStored ?? "");
  const walletLinked = !!xrplAddressStored;

  async function handleLinkWallet() {
    if (!walletAddress.trim()) return;
    await linkWallet(walletAddress.trim());
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Account</h1>
        <p className="text-white/40 text-sm">Manage your profile and security settings</p>
      </div>

      {/* Avatar + identity */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-5">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shrink-0">
          {avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{fullName || "Unnamed user"}</p>
          <p className="text-white/40 text-sm truncate">{user?.email}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">
            {user?.email_confirmed_at ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      {/* Profile section */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5 flex items-center gap-2">
          <User className="h-4 w-4 text-white/40" />
          Profile
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wide mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-11 rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/40 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
              <input
                type="email"
                value={email}
                disabled
                className="w-full h-11 rounded-xl border border-white/8 bg-white/3 pl-10 pr-4 text-sm text-white/40 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-white/25 mt-1.5">Email changes require re-authentication.</p>
          </div>

          {profileError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
              {profileError}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {profileLoading ? "Saving…" : "Save Changes"}
            </button>
            {profileSuccess && (
              <div className="flex items-center gap-1.5 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Password section — only for email users */}
      {!isOAuthUser && (
        <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-5">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5 flex items-center gap-2">
            <Lock className="h-4 w-4 text-white/40" />
            Password
          </h2>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {[
              { label: "New Password", value: newPassword, setter: setNewPassword },
              { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword },
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <label className="block text-xs text-white/40 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 rounded-xl border border-white/10 bg-white/5 pl-10 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}

            {passwordError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">
                {passwordError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                {passwordLoading ? "Updating…" : "Update Password"}
              </button>
              {passwordSuccess && (
                <div className="flex items-center gap-1.5 text-sm text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  Updated
                </div>
              )}
            </div>
          </form>
        </section>
      )}

      {/* ── Identity & DID ─────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-1 flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-white/40" />
          Decentralized Identity (XRP DID)
        </h2>
        <p className="text-xs text-white/30 mb-5">
          Required to register assets or request loans. Your DID binds your legal
          identity and wallet to every on-chain action you take on LiquidX.
        </p>

        {/* ── Resolved & verified banner ────────────────────────────────────── */}
        {identity?.didVerified && verification?.valid && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-semibold">Identity Verified</p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                DID Active
              </span>
            </div>
            <p className="font-mono text-xs text-white/40 break-all mb-3">{identity.did}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Key type", value: verification.publicKeyType?.replace("VerificationKey2018","") ?? "Secp256k1" },
                { label: "Trust level", value: verification.trustLevel ?? "low" },
                { label: "KYC", value: verification.hasKyc ? (verification.kycProvider ?? "Verified") : "None" },
                { label: "Jurisdiction", value: verification.jurisdiction ?? "Unknown" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-black/20 px-3 py-2">
                  <p className="text-[10px] text-white/25">{label}</p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5 capitalize">{value}</p>
                </div>
              ))}
            </div>
            {/* Verification errors — show even when mostly valid */}
            {verification.errors.length > 0 && (
              <div className="mt-3 space-y-1">
                {verification.errors.map((e, i) => (
                  <p key={i} className="text-[10px] text-yellow-400/70 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />{e}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resolved but invalid DID document */}
        {identity && !identity.didVerified && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400 font-semibold">DID document invalid</p>
            </div>
            <p className="font-mono text-xs text-white/30 break-all mb-2">{identity.did}</p>
            {verification?.errors.map((e, i) => (
              <p key={i} className="text-xs text-red-300/70 flex items-start gap-1.5 mt-1">
                <span className="shrink-0 mt-0.5">→</span>{e}
              </p>
            ))}
          </div>
        )}

        {/* Not yet connected */}
        {!walletLinked && (
          <div className="rounded-xl border border-white/8 bg-white/2 p-4 mb-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-white/20 shrink-0 mt-1.5" />
            <p className="text-sm text-white/50">
              Enter your XRPL address below to resolve your DID from the ledger.
            </p>
          </div>
        )}

        {/* ── Step 1 — Link XRPL wallet ─────────────────────────────────────── */}
        <div className={`rounded-xl border p-4 mb-3 ${walletLinked ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/2"}`}>
          <div className="flex items-start gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5 ${walletLinked ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/30"}`}>
              {walletLinked ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${walletLinked ? "text-white" : "text-white/60"}`}>
                Connect XRPL Wallet
              </p>
              {walletLinked ? (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-white/30 font-mono">
                    {(xrplAddressStored ?? "").slice(0, 12)}…{(xrplAddressStored ?? "").slice(-6)}
                  </p>
                  <button
                    onClick={clearIdentity}
                    className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="rNsD97gAPq9V3DRBfWkV32N6ihbF5oWBrD"
                    className="flex-1 h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/20 font-mono focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={handleLinkWallet}
                    disabled={!walletAddress.trim() || didLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 px-3 h-9 text-xs text-white font-medium transition-colors disabled:opacity-40"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    Connect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 2 — DID Resolution ───────────────────────────────────────── */}
        <div className={`rounded-xl border p-4 mb-3 transition-all ${
          !walletLinked ? "border-white/5 opacity-40" :
          didLoading ? "border-yellow-500/20 bg-yellow-500/5" :
          identity?.didVerified ? "border-emerald-500/20 bg-emerald-500/5" :
          identity ? "border-red-500/20 bg-red-500/5" :
          "border-white/8 bg-white/2"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
              !walletLinked ? "bg-white/8 text-white/30" :
              didLoading ? "bg-yellow-500/20 text-yellow-400" :
              identity?.didVerified ? "bg-emerald-500/20 text-emerald-400" :
              "bg-white/8 text-white/30"
            }`}>
              {didLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
               identity?.didVerified ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${walletLinked ? "text-white" : "text-white/30"}`}>
                DID Resolution
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {didLoading ? "Resolving DID document from XRPL…" :
                 identity?.didVerified ? `Resolved: ${formatDID(identity.did)}` :
                 identity ? "DID resolved — document invalid" :
                 "Fetches your DID document from XRPL on-chain storage, IPFS, or HTTPS"}
              </p>
              {didError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <XCircle className="h-3 w-3 shrink-0" />{didError}
                </p>
              )}
            </div>
            {walletLinked && !didLoading && (
              <button
                onClick={reResolveDID}
                className="text-xs text-primary hover:underline shrink-0"
              >
                Re-resolve
              </button>
            )}
          </div>
        </div>

        {/* ── Step 3 — DID Active ───────────────────────────────────────────── */}
        <div className={`rounded-xl border p-4 ${
          identity?.didVerified ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 opacity-40"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
              identity?.didVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-white/8 text-white/30"
            }`}>
              {identity?.didVerified ? <CheckCircle2 className="h-4 w-4" /> : "3"}
            </div>
            <div>
              <p className={`text-sm font-medium ${identity?.didVerified ? "text-white" : "text-white/30"}`}>
                XRP DID Issued &amp; Active
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                Your DID is anchored on the XRP Ledger and linked to all your activity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {identity?.didVerified ? (
            <a
              href={`https://testnet.xrpl.org/accounts/${xrplAddressStored}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              View on XRPL Explorer <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-white/6 bg-white/2 px-3 py-2.5 flex-1">
              <Shield className="h-3.5 w-3.5 text-white/25 shrink-0 mt-0.5" />
              <p className="text-xs text-white/30 leading-relaxed">
                Identity verification is required to register assets or request loans.
                Your legal identity is never public — only a cryptographic proof is stored on-chain.{" "}
                <a href="/trust" className="text-primary hover:underline">
                  Learn more <ChevronRight className="h-3 w-3 inline" />
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Sign out + Danger zone */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide mb-5">
          Session & Security
        </h2>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>

          <div className="pt-3 border-t border-white/6">
            <p className="text-xs text-white/25 uppercase tracking-wide mb-3">Danger Zone</p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2.5 w-full h-11 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : (
              <div className="rounded-xl border border-red-500/25 bg-red-500/8 p-4">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300/80">
                    This will permanently delete your account and all data. This cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 h-9 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 h-9 rounded-lg bg-red-500 text-xs text-white font-semibold hover:bg-red-500/90 transition-colors"
                    onClick={async () => {
                      await supabase.auth.admin?.deleteUser?.(user?.id ?? "");
                      await signOut();
                      router.push("/");
                    }}
                  >
                    Yes, delete my account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
