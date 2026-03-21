"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";

// Runs expireDeadlines() on mount and every 60 seconds.
// Any "open" asset whose fundingDeadline is in the past gets marked "expired"
// and all its locked escrow positions are auto-refunded.
export function DeadlineWatcher() {
  const expireDeadlines = usePortfolioStore((s) => s.expireDeadlines);

  useEffect(() => {
    expireDeadlines();
    const interval = setInterval(expireDeadlines, 60_000);
    return () => clearInterval(interval);
  }, [expireDeadlines]);

  return null;
}
