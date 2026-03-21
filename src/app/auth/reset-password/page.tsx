"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <Zap className="h-4 w-4 text-black" />
            </div>
            <span className="text-white text-xl font-bold">Liquid<span className="text-primary">X</span></span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Password updated</h2>
              <p className="text-sm text-white/40">Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">New password</h1>
                <p className="text-sm text-white/40">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "New Password", value: password, setter: setPassword },
                  { label: "Confirm Password", value: confirm, setter: setConfirm },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-xs text-white/50 uppercase tracking-wide mb-1.5">{label}</label>
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
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}

                {error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-400">{error}</div>
                )}

                <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50">
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
