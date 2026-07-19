"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Send, Paperclip, Settings } from "lucide-react";
import { processChatQuery } from "@/lib/chat-service";

export default function ChatPage() {
  type Message = { id: number; role: "user" | "assistant"; content: string };

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

  const suggestedPrompts = [
    "What are the main pain points identified?",
    "Show me the top opportunities",
    "Tell me about the personas",
    "What themes are most common?",
    "What's the overall sentiment?",
    "Give me a summary of the analysis",
  ];

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      role: "user" as const,
      content: messageText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    // Process query and get response with proper error handling
    try {
      const timeoutPromise = new Promise<{ content: string }>((_, reject) =>
        setTimeout(() => reject(new Error("Chat timeout")), 10000)
      );

      const responsePromise = new Promise<{ content: string }>((resolve) => {
        setTimeout(() => {
          try {
            const response = processChatQuery(messageText);
            resolve(response);
          } catch (error) {
            console.error("Error processing chat query:", error);
            resolve({ content: "Sorry, I encountered an error processing your request." });
          }
        }, 800);
      });

      const response = await Promise.race([responsePromise, timeoutPromise]);

      const newAssistantMessage = {
        id: messages.length + 2,
        role: "assistant" as const,
        content: response.content,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: messages.length + 2,
        role: "assistant" as const,
        content: "Sorry, I couldn't process your message. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Chat History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 h-full">
            <h3 className="text-sm font-semibold text-white mb-4">
              Conversation History
            </h3>
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
                <h2 className="text-xl font-semibold text-white mb-2">
                  Start a Conversation
                </h2>
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
              <h3 className="text-sm font-semibold text-white mb-3">
                Suggested Prompts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-2 px-3 border-slate-600 text-slate-300 hover:text-white text-sm text-left"
                    onClick={() => handleSendMessage(prompt)}
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
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shrink-0"
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
