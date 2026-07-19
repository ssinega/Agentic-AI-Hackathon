import { PersonaCard } from "./PersonaCard";

interface Persona {
  id: string;
  name: string;
  type: "primary" | "secondary" | "tertiary";
  size: "large" | "medium" | "small";
  goals: string;
  frustrations: string;
}

interface PersonaGridProps {
  personas: Persona[];
}

export function PersonaGrid({ personas }: PersonaGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => (
        <PersonaCard key={persona.id} {...persona} />
      ))}
    </div>
  );
}