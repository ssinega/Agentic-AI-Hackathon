import { Card } from "@/components/ui/Card";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm flex-1 overflow-y-auto">
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div>
              <div
                className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                {msg.content}
              </div>
              {msg.timestamp && (
                <p className="text-xs text-slate-500 mt-1">{msg.timestamp}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}