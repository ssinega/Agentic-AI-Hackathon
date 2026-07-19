import { ThemeCard } from "./ThemeCard";

interface Theme {
  id: string;
  name: string;
  frequency: number;
  insights: string[];
}

interface ThemesListProps {
  themes: Theme[];
}

export function ThemesList({ themes }: ThemesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {themes.map((theme) => (
        <ThemeCard key={theme.id} {...theme} />
      ))}
    </div>
  );
}