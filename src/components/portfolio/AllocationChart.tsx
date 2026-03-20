"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "hsl(174, 100%, 45%)",
  "hsl(200, 100%, 55%)",
  "hsl(220, 90%, 60%)",
  "hsl(160, 80%, 50%)",
  "hsl(185, 90%, 48%)",
  "hsl(240, 70%, 65%)",
];

interface TooltipPayload {
  name: string;
  value: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d0d0d] p-3 shadow-xl">
        <p className="text-sm font-medium text-white mb-1">{payload[0].name}</p>
        <p className="text-sm font-mono text-primary">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function AllocationChart() {
  const { holdings, assets } = usePortfolioStore();

  const data = holdings.map((h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return {
      name: asset?.name ?? h.assetId,
      value: h.tokens * (asset?.tokenPrice ?? 100),
    };
  });

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-white/40 text-sm">
        No holdings yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-white/50">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
