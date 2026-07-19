import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface InsightCardProps {
  content: string;
  type: "customer_need" | "pain_point" | "feature_request" | "feedback" | "behavior";
  sentiment: "positive" | "negative" | "neutral";
  frequency: number;
}

export function InsightCard({
  content,
  type,
  sentiment,
  frequency,
}: InsightCardProps) {
  const sentimentColors = {
    positive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    negative: "bg-red-500/10 text-red-400 border-red-500/20",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition">
      <p className="text-white font-medium mb-3">{content}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-xs capitalize">
          {type.replace("_", " ")}
        </Badge>
        <Badge className={`text-xs border ${sentimentColors[sentiment]}`}>
          {sentiment}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {frequency}x mentioned
        </Badge>
      </div>
    </Card>
  );
}