"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useTonAddress, TonConnectButton } from "@tonconnect/ui-react";
import { Wallet, BarChart3, Store, PlusSquare, Zap } from "lucide-react";

const navLinks = [
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { href: "/tokenize", label: "Tokenize", icon: PlusSquare },
];

export function Navbar() {
  const pathname = usePathname();
  const usdcBalance = usePortfolioStore((s) => s.usdcBalance);
  const tonAddress = useTonAddress();

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
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === href
                      ? "text-white bg-white/10"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 shrink-0">
              {/* USDC Balance */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(usdcBalance)}
                </span>
                <span className="text-xs text-primary font-medium">USDC</span>
              </div>

              {/* TON Wallet */}
              <div className="ton-connect-btn">
                <TonConnectButton />
              </div>

              {/* Connected indicator */}
              {tonAddress && (
                <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium">
                    {tonAddress.slice(0, 6)}…{tonAddress.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
