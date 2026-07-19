import { OpportunityCard } from "./OpportunityCard";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  score: number;
  severity: "high" | "medium" | "low";
}

interface OpportunitiesListProps {
  opportunities: Opportunity[];
}

export function OpportunitiesList({ opportunities }: OpportunitiesListProps) {
  return (
    <div className="space-y-3">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} {...opp} />
      ))}
    </div>
  );
}