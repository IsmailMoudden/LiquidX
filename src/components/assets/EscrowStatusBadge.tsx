import { FundingStatus, InvestmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock, CheckCircle2, RefreshCw, XCircle, Clock, AlertTriangle } from "lucide-react";

const FUNDING_CONFIG: Record<
  FundingStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  open: {
    label: "Open for Funding",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-blue-500/15 border-blue-500/25 text-blue-400",
  },
  funded: {
    label: "Target Reached",
    icon: <Lock className="h-3 w-3" />,
    className: "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
  },
  released: {
    label: "Settled",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
  refunded: {
    label: "Refunded",
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/15 border-red-500/25 text-red-400",
  },
  expired: {
    label: "Deadline Passed",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-orange-500/15 border-orange-500/25 text-orange-400",
  },
  repaid: {
    label: "Repaid",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
};

const INVESTMENT_CONFIG: Record<
  InvestmentStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-blue-500/15 border-blue-500/25 text-blue-400",
  },
  locked: {
    label: "Locked in Escrow",
    icon: <Lock className="h-3 w-3" />,
    className: "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
  },
  released: {
    label: "Released",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
  refunded: {
    label: "Refunded",
    icon: <RefreshCw className="h-3 w-3" />,
    className: "bg-red-500/15 border-red-500/25 text-red-400",
  },
  // New canonical statuses
  active: {
    label: "Active",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
  earning: {
    label: "Earning",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
  withdrawn: {
    label: "Withdrawn",
    icon: <RefreshCw className="h-3 w-3" />,
    className: "bg-white/10 border-white/15 text-white/50",
  },
  "locked-in-escrow": {
    label: "Locked in Escrow",
    icon: <Lock className="h-3 w-3" />,
    className: "bg-yellow-500/15 border-yellow-500/25 text-yellow-400",
  },
  repaid: {
    label: "Repaid",
    icon: <CheckCircle2 className="h-3 w-3" />,
    className: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",
  },
};

export function FundingStatusBadge({ status }: { status: FundingStatus }) {
  const cfg = FUNDING_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        cfg.className
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function InvestmentStatusBadge({ status }: { status: InvestmentStatus }) {
  const cfg = INVESTMENT_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        cfg.className
      )}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
