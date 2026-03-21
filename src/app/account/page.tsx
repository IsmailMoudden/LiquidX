"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
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
} from "lucide-react";

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
