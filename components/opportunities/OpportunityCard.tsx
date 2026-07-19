import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp } from "lucide-react";

interface OpportunityCardProps {
  title: string;
  description: string;
  score: number;
  severity: "high" | "medium" | "low";
}

export function OpportunityCard({
  title,
  description,
  score,
  severity,
}: OpportunityCardProps) {
  const severityColors = {
    high: "bg-red-500/10 text-red-400",
    medium: "bg-amber-500/10 text-amber-400",
    low: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end">
            <TrendingUp className="w-4 h-4 text-emerald-400 mr-1" />
            <span className="font-bold text-white">{score}</span>
          </div>
        </div>
      </div>
      <Badge className={`text-xs capitalize ${severityColors[severity]}`}>
        {severity} priority
      </Badge>
    </Card>
  );
}