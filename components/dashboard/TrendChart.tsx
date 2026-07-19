import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";

interface TrendChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

export function TrendChart({ title, data }: TrendChartProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: "#6366f1" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}