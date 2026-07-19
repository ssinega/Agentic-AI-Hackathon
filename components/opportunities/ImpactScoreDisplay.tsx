import { Card } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

interface ImpactScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
}

export function ImpactScoreDisplay({
  score,
  maxScore = 100,
  label = "Impact Score",
}: ImpactScoreDisplayProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    score >= 80
      ? "from-emerald-600 to-teal-600"
      : score >= 50
      ? "from-amber-600 to-orange-600"
      : "from-red-600 to-rose-600";

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-sm">{label}</span>
        <TrendingUp className="w-4 h-4 text-emerald-400" />
      </div>

      <div className="mb-4">
        <div className="text-3xl font-bold text-white mb-2">{score}</div>
        <div className="w-full bg-slate-700/50 rounded-full h-3">
          <div
            className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <p className="text-xs text-slate-400">{percentage.toFixed(0)}% utilization</p>
    </Card>
  );
}