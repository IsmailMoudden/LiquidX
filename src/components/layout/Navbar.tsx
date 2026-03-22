"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTonAddress } from "@tonconnect/ui-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useIdentityStore, selectDidVerified, selectDisplayDid } from "@/store/identity-store";
import { Zap, Shield, TrendingUp, Banknote, BarChart3, Layers, ShieldCheck, FlaskConical, User, LogOut, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/lend", label: "Lend", icon: TrendingUp },
  { href: "/borrow", label: "Borrow", icon: Banknote },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/tokenize", label: "Register Asset", icon: Layers },
  { href: "/trust", label: "Trust", icon: ShieldCheck },
  { href: "/demo", label: "Demo", icon: FlaskConical },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const tonAddress = useTonAddress();
  const { user, signOut } = useAuth();
  const didVerified = useIdentityStore(selectDidVerified);
  const displayDid = useIdentityStore(selectDisplayDid);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const avatarLetter = (user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase();

  return (
    <nav className="sticky top-0 z-50 flex justify-center px-4 pt-4 pb-2">
      <div className="cassis-nav rounded-2xl w-full max-w-5xl">
        <div className="px-5 sm:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Zap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-white text-lg font-bold tracking-tight">
                Liquid<span className="text-primary">X</span>
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  title={label || undefined}
                  className={cn(
                    "rounded-lg text-sm font-medium transition-all duration-200",
                    label ? "px-4 py-1.5" : "p-2",
                    pathname === href
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  {label ? label : <Icon className="h-4 w-4" />}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 shrink-0">
              {/* DID verified badge */}
              {didVerified && displayDid && (
                <Link
                  href="/account"
                  className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1"
                  title={displayDid}
                >
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">ID Verified</span>
                </Link>
              )}

              {/* Connected TON wallet pill */}
              {tonAddress && (
                <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">
                    {tonAddress.slice(0, 6)}…{tonAddress.slice(-4)}
                  </span>
                </div>
              )}

              {/* Validator icon */}
              <Link
                href="/validator"
                title="Validator"
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  pathname === "/validator"
                    ? "text-white bg-white/10"
                    : "text-white/50 hover:text-white/80"
                )}
              >
                <Shield className="h-4 w-4" />
              </Link>

              {/* Auth */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center text-xs font-bold text-primary">
                      {avatarLetter}
                    </div>
                    <ChevronDown className="h-3 w-3 text-white/40" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0d0d0d] shadow-xl py-1 z-50">
                      <div className="px-3 py-2 border-b border-white/8">
                        <p className="text-xs text-white font-medium truncate">{user.user_metadata?.full_name || "Account"}</p>
                        <p className="text-xs text-white/40 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Account
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/sign-in"
                  className="flex items-center gap-2 h-8 px-4 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
