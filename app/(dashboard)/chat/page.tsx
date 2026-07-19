"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Send, Paperclip, Settings, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ChatPage() {
  type Message = { id: number; role: "user" | "assistant"; content: string };

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const projectId = searchParams.get("projectId");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI research assistant. Ask me anything about your uploaded documents, insights, personas, opportunities, or trends in your data.",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIdRef = useRef(2);

  const suggestedPrompts = [
    "What are the main pain points identified?",
    "Show me the top opportunities",
    "Tell me about the personas",
    "What themes are most common?",
    "What's the overall sentiment?",
    "Give me a summary of the analysis",
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || !projectId) return;

    // Add user message
    const userMessageId = messageIdRef.current;
    messageIdRef.current += 1;
    const newUserMessage = {
      id: userMessageId,
      role: "user" as const,
      content: messageText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({
          projectId,
          message: messageText,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to get response");
      }

      const data = await response.json();

      const assistantMessageId = messageIdRef.current;
      messageIdRef.current += 1;
      const newAssistantMessage = {
        id: assistantMessageId,
        role: "assistant" as const,
        content: data.response || "I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Chat error:", errorMsg);
      setError(errorMsg);

      const assistantMessageId = messageIdRef.current;
      messageIdRef.current += 1;
      const errorMessage = {
        id: assistantMessageId,
        role: "assistant" as const,
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!projectId) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">Please select a project to use chat</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
          <p className="text-slate-400 mt-1">Chat with AI to explore your research data</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-slate-600 text-slate-300 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Chat History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 h-full">
            <h3 className="text-sm font-semibold text-white mb-4">Conversation History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-left text-slate-400 hover:text-white hover:bg-slate-700/50 truncate"
                >
                  <span className="text-xs truncate">
                    {i === 1
                      ? "Current Chat"
                      : `Chat ${i} - ${Math.floor(Math.random() * 24)} hours ago`}
                  </span>
                </Button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {messages.length === 1 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <Card className="p-8 bg-slate-800/50 border-slate-700/50 text-center max-w-md">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Start a Conversation</h2>
                <p className="text-slate-400 text-sm mb-6">
                  Ask me questions about your research, insights, and data
                </p>
              </Card>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto mb-4">
              <ChatInterface messages={messages} />
            </div>
          )}

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50 mb-4">
              <h3 className="text-sm font-semibold text-white mb-3">Suggested Prompts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3 border-slate-600 text-slate-300 hover:text-white text-sm text-left"
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Input Area */}
          <Card className="p-4 bg-slate-800/50 border-slate-700/50">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white shrink-0"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                type="text"
                placeholder="Ask me anything about your research..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
