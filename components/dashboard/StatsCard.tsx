import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend: string;
  trendColor?: "up" | "down" | "neutral";
}

export function StatsCard({
  icon,
  label,
  value,
  trend,
  trendColor = "neutral",
}: StatsCardProps) {
  const trendColors = {
    up: "text-emerald-400",
    down: "text-red-400",
    neutral: "text-indigo-400",
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/50 transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className={`text-xs ${trendColors[trendColor]} mt-2`}>{trend}</p>
        </div>
        <div className="text-indigo-600 opacity-50">{icon}</div>
      </div>
    </Card>
  );
}