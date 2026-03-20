"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AssetCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Layers,
  Building2,
  Zap,
  Palette,
  Wine,
  ArrowRight,
} from "lucide-react";

const CATEGORY_OPTIONS: { value: AssetCategory; label: string; icon: React.ReactNode }[] = [
  { value: "real-estate", label: "Real Estate", icon: <Building2 className="h-4 w-4" /> },
  { value: "infrastructure", label: "Infrastructure", icon: <Zap className="h-4 w-4" /> },
  { value: "art", label: "Art", icon: <Palette className="h-4 w-4" /> },
  { value: "wine", label: "Wine & Spirits", icon: <Wine className="h-4 w-4" /> },
  { value: "collectibles", label: "Collectibles", icon: <ArrowRight className="h-4 w-4" /> },
  { value: "private-equity", label: "Private Equity", icon: <ArrowRight className="h-4 w-4" /> },
  { value: "commodities", label: "Commodities", icon: <ArrowRight className="h-4 w-4" /> },
];

const PLACEHOLDER_IMAGES: Record<AssetCategory, string> = {
  "real-estate": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  infrastructure: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
  art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  collectibles: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
  "private-equity": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80",
  commodities: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
};

interface FormState {
  name: string;
  category: AssetCategory | "";
  description: string;
  location: string;
  totalValue: string;
  tokenSupply: string;
  projectedYield: string;
  liquidityScore: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  category: "",
  description: "",
  location: "",
  totalValue: "",
  tokenSupply: "",
  projectedYield: "",
  liquidityScore: "7",
};

export default function TokenizePage() {
  const router = useRouter();
  const tokenizeAsset = usePortfolioStore((s) => s.tokenizeAsset);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [success, setSuccess] = useState(false);
  const [newAssetId, setNewAssetId] = useState("");

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const tokenPrice =
    form.totalValue && form.tokenSupply
      ? parseFloat(form.totalValue) / parseFloat(form.tokenSupply)
      : null;

  const isValid =
    form.name.trim() &&
    form.category &&
    form.description.trim() &&
    form.location.trim() &&
    parseFloat(form.totalValue) > 0 &&
    parseFloat(form.tokenSupply) > 0 &&
    parseFloat(form.projectedYield) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !form.category) return;

    const newAsset = tokenizeAsset({
      name: form.name,
      category: form.category as AssetCategory,
      description: form.description,
      longDescription: form.description,
      image: PLACEHOLDER_IMAGES[form.category as AssetCategory],
      location: form.location,
      totalValue: parseFloat(form.totalValue),
      tokenSupply: parseFloat(form.tokenSupply),
      tokenPrice: tokenPrice ?? 100,
      projectedYield: parseFloat(form.projectedYield),
      liquidityScore: parseInt(form.liquidityScore),
      minInvestment: 100,
      tags: [form.category],
      highlights: [
        `${form.projectedYield}% projected annual yield`,
        `Total valuation: $${parseFloat(form.totalValue).toLocaleString()}`,
        `${form.tokenSupply} tokens at $${tokenPrice?.toFixed(2)} each`,
      ],
    });

    setNewAssetId(newAsset.id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Asset Tokenized!</h1>
        <p className="text-muted-foreground mb-8">
          <span className="text-foreground font-medium">{form.name}</span> has
          been successfully tokenized and is now live on the marketplace.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href={`/assets/${newAssetId}`}>
              View Asset
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setForm(INITIAL_FORM);
              setSuccess(false);
            }}
          >
            Tokenize Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold">Tokenize an Asset</h1>
        </div>
        <p className="text-muted-foreground">
          List a real-world asset on LiquidX. It will be immediately available
          for fractional investment on the marketplace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Asset Information</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                Asset Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Paris Haussmann Apartment Block"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Category <span className="text-red-400">*</span>
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => update("category", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Location <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="e.g. Paris, France"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none transition-colors"
                placeholder="Describe the asset, its characteristics, and investment case..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Tokenization params */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Tokenization Parameters</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Total Valuation (USD) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  placeholder="1000000"
                  className="pl-7 font-mono"
                  value={form.totalValue}
                  onChange={(e) => update("totalValue", e.target.value)}
                  min="1000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Token Supply <span className="text-red-400">*</span>
              </label>
              <Input
                type="number"
                placeholder="10000"
                className="font-mono"
                value={form.tokenSupply}
                onChange={(e) => update("tokenSupply", e.target.value)}
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Projected Annual Yield (%) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="7.5"
                  step="0.1"
                  className="pr-8 font-mono"
                  value={form.projectedYield}
                  onChange={(e) => update("projectedYield", e.target.value)}
                  min="0"
                  max="50"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Liquidity Score (1–10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                className="font-mono"
                value={form.liquidityScore}
                onChange={(e) => update("liquidityScore", e.target.value)}
              />
            </div>
          </div>

          {/* Computed token price */}
          {tokenPrice !== null && tokenPrice > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Computed Token Price</span>
              <span className="font-mono font-bold text-primary">
                ${tokenPrice.toFixed(2)} USDC
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isValid}
        >
          <Layers className="h-4 w-4" />
          Tokenize Asset
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This is a demo platform. No real assets or transactions are involved.
        </p>
      </form>
    </div>
  );
}
