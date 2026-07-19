import { Card } from "@/components/ui/Card";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
}

export function ChatInterface({ messages }: ChatInterfaceProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm h-96 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}