import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { X } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  onFilterChange: (filters: Record<string, string[]>) => void;
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const types = ["feature_request", "pain_point", "customer_need", "feedback"];
  const sentiments = ["positive", "negative", "neutral"];

  const toggleFilter = (category: string, value: string) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = [];
      const idx = updated[category].indexOf(value);
      if (idx > -1) {
        updated[category].splice(idx, 1);
      } else {
        updated[category].push(value);
      }
      onFilterChange(updated);
      return updated;
    });
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700/50">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-white mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Badge
                key={type}
                variant={activeFilters.type?.includes(type) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter("type", type)}
              >
                {type.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-2">Sentiment</p>
          <div className="flex flex-wrap gap-2">
            {sentiments.map((sentiment) => (
              <Badge
                key={sentiment}
                variant={activeFilters.sentiment?.includes(sentiment) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFilter("sentiment", sentiment)}
              >
                {sentiment}
              </Badge>
            ))}
          </div>
        </div>
        {Object.keys(activeFilters).length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveFilters({});
              onFilterChange({});
            }}
            className="w-full"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </Card>
  );
}