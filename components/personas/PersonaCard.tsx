import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PersonaCardProps {
  name: string;
  type: "primary" | "secondary" | "tertiary";
  size: "large" | "medium" | "small";
  goals: string;
  frustrations: string;
}

export function PersonaCard({
  name,
  type,
  size,
  goals,
  frustrations,
}: PersonaCardProps) {
  const typeColors = {
    primary: "bg-indigo-500/10 text-indigo-400",
    secondary: "bg-purple-500/10 text-purple-400",
    tertiary: "bg-slate-500/10 text-slate-400",
  };

  const sizeColors = {
    large: "bg-emerald-500/10 text-emerald-400",
    medium: "bg-amber-500/10 text-amber-400",
    small: "bg-slate-500/10 text-slate-400",
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold mb-3">
          {name[0]}
        </div>
        <h3 className="text-lg font-semibold text-white">{name}</h3>
      </div>
      <div className="space-y-3">
        <div>
          <Badge className={`text-xs capitalize ${typeColors[type]}`}>
            {type}
          </Badge>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Segment Size</p>
          <Badge className={`text-xs capitalize ${sizeColors[size]}`}>
            {size}
          </Badge>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Goals</p>
          <p className="text-white text-sm">{goals}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-1">Frustrations</p>
          <p className="text-white text-sm">{frustrations}</p>
        </div>
      </div>
    </Card>
  );
}