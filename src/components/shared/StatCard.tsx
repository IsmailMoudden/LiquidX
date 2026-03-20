import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/7 bg-[#0d0d0d] p-5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
          {subValue && (
            <p
              className={cn(
                "text-xs mt-1",
                trend === "up"
                  ? "text-primary"
                  : trend === "down"
                  ? "text-red-400"
                  : "text-white/40"
              )}
            >
              {subValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
