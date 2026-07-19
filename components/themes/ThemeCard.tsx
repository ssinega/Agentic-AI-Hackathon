import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ThemeCardProps {
  name: string;
  frequency: number;
  insights: string[];
}

export function ThemeCard({ name, frequency, insights }: ThemeCardProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition">
      <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>
      <Badge className="bg-indigo-500/10 text-indigo-400 mb-4">
        {frequency} mentions
      </Badge>
      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start text-sm">
            <span className="text-indigo-400 mr-2">•</span>
            <span className="text-slate-300">{insight}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}