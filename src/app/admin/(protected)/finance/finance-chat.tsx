
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { chatWithCFO } from "@/app/actions/cfo-actions";
import { toast } from "sonner";

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

export function FinanceChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am your CFO Agent. Ask me about your net worth, spending, or budget." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Only send last few messages for context to save tokens, or full history if needed
            // Filter out tools calls from history passed to client for now
            const historyForAI = messages.filter(m => m.role !== "system").map(m => ({ role: m.role, content: m.content }));
            
            const res = await chatWithCFO(historyForAI, userMsg.content);
            if (res.success && res.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: res.reply as string }]);
            } else {
                toast.error("Agent failed to respond.");
            }
        } catch (e) {
            toast.error("Error communicating with agent.");
        }
        setIsLoading(false);
    };

    return (
        <Card className="h-[600px] flex flex-col border-purple-200/20 shadow-xl">
             <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">CFO Agent</CardTitle>
                        <CardDescription>Powered by OpenAI</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                {m.role === "assistant" && (
                                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-purple-600" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                    m.role === "user" 
                                    ? "bg-purple-600 text-white" 
                                    : "bg-muted text-foreground"
                                }`}>
                                    {m.content}
                                </div>
                                {m.role === "user" && (
                                     <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-slate-600" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                 <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                    <LoaderDots />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                        <Input 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            placeholder="Ask about your finances..." 
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

function LoaderDots() {
    return (
        <span className="flex space-x-1">
             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
             <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
        </span>
    )
}
