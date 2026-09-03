import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "amber" | "emerald" | "sky" | "stone";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "amber",
}: StatsCardProps) {
  const colorStyles = {
    amber: {
      bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
      accent: "text-amber-400",
    },
    emerald: {
      bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      accent: "text-emerald-400",
    },
    sky: {
      bg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
      accent: "text-sky-400",
    },
    stone: {
      bg: "bg-stone-800/50 border-stone-700/60 text-stone-300",
      accent: "text-stone-100",
    },
  };

  const currentStyle = colorStyles[color];

  return (
    <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-4.5 backdrop-blur shadow-sm hover:border-stone-700/80 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          {title}
        </span>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl border p-1.5",
            currentStyle.bg
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className={cn("text-2xl font-black tracking-tight", currentStyle.accent)}>
          {value}
        </span>
        {subtitle && <p className="mt-0.5 text-xs text-stone-400">{subtitle}</p>}
      </div>
    </div>
  );
}
