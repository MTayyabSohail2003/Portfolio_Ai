"use client";

import { useChat } from "@/lib/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, RefreshCw, Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const STARTERS = [
    "What are Muhammad Tayyab's core skills?",
    "Tell me about his experience at Arbisoft.",
    "Does he have experience with AI Agents?",
    "How can I contact him?"
];

export default function ChatPage() {
    const { messages, sendMessage, status, regenerate, setMessages } = useChat();

    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isLoading = status === 'streaming' || status === 'submitted';
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!hasInitialized.current && messages.length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content: "Hello! I am Muhammad Tayyab's AI Agent. I have access to his entire professional portfolio. Ask me about his experience, technical skills, or specific projects."
                } as any
            ]);
            hasInitialized.current = true;
        }
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        // @ts-ignore
        await sendMessage(userMessage);
    };

    const handleReload = () => {
        setMessages([]);
        regenerate();
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight">AI Agent Interface</h1>
                <p className="text-muted-foreground">The system is online. Ask anything.</p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="border-b px-6 py-4 flex flex-row items-center justify-between bg-primary/5">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Neural Agent <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">Online</span>
                        </CardTitle>
                        <CardDescription>RAG-Enabled • Custom Portfolio Model • Context Aware</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReload} title="Reset Chat">
                        <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden p-0 relative flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                        <div className="flex flex-col gap-6 pb-4">
                            {messages.map((m: any) => (
                                <div
                                    key={m.id}
                                    className={cn(
                                        "flex items-start gap-4 max-w-[85%] rounded-2xl p-4 text-sm shadow-sm",
                                        m.role === "user"
                                            ? "ml-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm"
                                            : "bg-muted/80 backdrop-blur-md text-foreground rounded-tl-sm border"
                                    )}
                                >
                                    {m.role === "user" ? <User className="h-5 w-5 mt-1 shrink-0 opacity-70" /> : <Bot className="h-5 w-5 mt-1 shrink-0 text-primary" />}
                                    <div className="prose prose-sm dark:prose-invert overflow-wrap-anywhere break-words">
                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm p-4 animate-pulse">
                                    <Bot className="h-4 w-4" />
                                    Thinking...
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Starter Chips (Only show if history is short) */}
                    {messages.length <= 1 && (
                        <div className="p-4 pt-0 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mask-gradient">
                            {STARTERS.map(starter => (
                                <Button
                                    key={starter}
                                    variant="secondary"
                                    size="sm"
                                    className="whitespace-nowrap rounded-full bg-secondary/50 hover:bg-primary hover:text-primary-foreground border-transparent transition-all shadow-sm"
                                    onClick={() => {
                                        setInput(starter);
                                        // Optional: auto-submit or just fill
                                        // To auto-submit, we'd need to bypass the form state or call sendMessage directly.
                                        // Let's just fill for now to let user confirm.
                                    }}
                                >
                                    <Sparkles className="mr-1.5 h-3 w-3" />
                                    {starter}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>

                <div className="p-4 bg-background/80 border-t backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-muted/50 border rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Muhammad Tayyab's experience..."
                            className="flex-1 bg-transparent px-4 py-3 outline-none placeholder:text-muted-foreground min-h-[44px] max-h-[200px] resize-none text-sm "
                            rows={1}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className={cn("h-10 w-10 rounded-xl transition-all", isLoading || !input.trim() ? "opacity-50" : "hover:scale-105")}
                            disabled={isLoading || !input.trim()}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </form>
                    <div className="text-xs text-center text-muted-foreground mt-2 opacity-50">
                        AI can make mistakes. Check important info.
                    </div>
                </div>
            </Card>
        </div>
    );
}
