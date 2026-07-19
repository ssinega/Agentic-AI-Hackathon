import { Card } from "@/components/ui/Card";

interface Insight {
  id: number;
  content: string;
  type: string;
  sentiment: string;
  frequency: number;
}

interface InsightsListProps {
  insights: Insight[];
  isLoading?: boolean;
}

export function InsightsList({ insights, isLoading = false }: InsightsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 bg-slate-800/50 border-slate-700/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {insights.map((insight) => (
        <Card
          key={insight.id}
          className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
        >
          <p className="text-white font-medium">{insight.content}</p>
        </Card>
      ))}
    </div>
  );
}