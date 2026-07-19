import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  score: number;
  severity: "high" | "medium" | "low";
}

interface TopOpportunitiesProps {
  opportunities: Opportunity[];
}

export function TopOpportunities({ opportunities }: TopOpportunitiesProps) {
  const severityColors = {
    high: "bg-red-500/10 text-red-400",
    medium: "bg-amber-500/10 text-amber-400",
    low: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4">Top Opportunities</h2>
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opp) => (
          <div key={opp.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-white text-sm font-medium">{opp.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`text-xs ${severityColors[opp.severity]}`}>
                {opp.severity}
              </Badge>
              <span className="font-bold text-white text-sm">{opp.score}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}