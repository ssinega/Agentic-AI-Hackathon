import { Button } from "@/components/ui/Button";
import { Lightbulb } from "lucide-react";

interface SuggestedPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ prompts, onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Lightbulb className="w-4 h-4" />
        <p className="text-sm">Suggested questions:</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {prompts.map((prompt, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="justify-start text-left h-auto py-2 border-slate-600 hover:border-indigo-500"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
}