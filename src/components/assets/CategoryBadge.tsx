import { AssetCategory } from "@/lib/types";
import {
  Building2,
  Zap,
  Palette,
  Wine,
  Watch,
  TrendingUp,
  Gem,
} from "lucide-react";

const CATEGORY_CONFIG: Record<
  AssetCategory,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  "real-estate": {
    label: "Real Estate",
    icon: Building2,
    color: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  },
  infrastructure: {
    label: "Infrastructure",
    icon: Zap,
    color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  },
  art: {
    label: "Art",
    icon: Palette,
    color: "bg-purple-500/20 text-purple-300 border-purple-500/20",
  },
  wine: {
    label: "Wine & Spirits",
    icon: Wine,
    color: "bg-rose-500/20 text-rose-300 border-rose-500/20",
  },
  collectibles: {
    label: "Collectibles",
    icon: Watch,
    color: "bg-orange-500/20 text-orange-300 border-orange-500/20",
  },
  "private-equity": {
    label: "Private Equity",
    icon: TrendingUp,
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
  },
  commodities: {
    label: "Commodities",
    icon: Gem,
    color: "bg-amber-500/20 text-amber-300 border-amber-500/20",
  },
};

export function CategoryBadge({ category }: { category: AssetCategory }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export { CATEGORY_CONFIG };
