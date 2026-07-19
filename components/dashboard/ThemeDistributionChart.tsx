import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/Card";

interface ThemeDistributionChartProps {
  title: string;
  data: Array<{ name: string; value: number }>;
}

const COLORS = ["#6366f1", "#a855f7", "#06b6d4", "#10b981", "#f59e0b"];

export function ThemeDistributionChart({ title, data }: ThemeDistributionChartProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}

          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}