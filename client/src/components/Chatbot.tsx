import { useMemo, useState, useEffect } from "react";
import { Send, MessageCircle, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { sendGroqChat, type ChatMessage } from "@/services/groq";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useActivityTracking } from "@/hooks/useActivityTracking";

export function Chatbot() {
  const { user } = useAuth();
  const activityTracker = useActivityTracking();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI assistant. Ask me about using the builder or any project questions.",
    },
  ]);
  const { toast } = useToast();

  const groqReady = useMemo(
    () => Boolean(import.meta.env.VITE_GROQ_API_KEY),
    [],
  );

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    
    // Log user message
    activityTracker.logChatbotMessage({
      role: 'user',
      content: trimmed,
    });

    const nextMessages = [...messages, { role: "user", content: trimmed } as ChatMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendGroqChat(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      
      // Log assistant message
      activityTracker.logChatbotMessage({
        role: 'assistant',
        content: reply,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Chat error",
        description:
          error instanceof Error ? error.message : "Could not reach Groq.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only show chatbot when user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-80 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Assistant</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {!groqReady && (
              <div className="mb-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">
                Set <code>VITE_GROQ_API_KEY</code> to enable replies.
              </div>
            )}
            <ScrollArea className="h-64 pr-2">
              <div className="flex flex-col gap-3 text-sm">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Groq is thinking...
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Textarea
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[70px]"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !groqReady}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      <Button
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-yellow-500 hover:from-yellow-400 hover:to-primary text-black font-bold border-none p-0"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  );
}
