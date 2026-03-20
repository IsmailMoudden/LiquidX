import { Badge } from "@/components/ui/badge";
import { AssetCategory } from "@/lib/types";
import { Building2, Zap, Palette, Wine } from "lucide-react";

const CATEGORY_CONFIG: Record<
  AssetCategory,
  {
    label: string;
    variant: "default" | "blue" | "purple" | "warning" | "orange";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  "real-estate": { label: "Real Estate", variant: "blue", icon: Building2 },
  infrastructure: { label: "Infrastructure", variant: "warning", icon: Zap },
  art: { label: "Art", variant: "purple", icon: Palette },
  wine: { label: "Fine Wine", variant: "orange", icon: Wine },
};

export function CategoryBadge({ category }: { category: AssetCategory }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
