'use client'
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, X, User, Sparkles, ShieldAlert, ArrowUp, RefreshCw, Mic, MicOff, Volume2, VolumeX, Phone } from "lucide-react";
import { chatWithUniversalAgent } from "@/app/actions/universal-chat-actions";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { VoiceVisualizer } from "./voice-visualizer";
import { VoiceCallOverlay } from "./voice-call-overlay";

interface Message {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
}

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState<string>("public");

    const [isListening, setIsListening] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Toggle for TTS
    const [isCallMode, setIsCallMode] = useState(false); // Live Call Overlay
    const recognitionRef = useRef<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    handleSend(transcript); // Auto-send
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            toast.info("Listening...");
        }
    };

    const speak = (text: string) => {
        if (!isVoiceEnabled || typeof window === "undefined") return;

        // Strip markdown/code for clearer speech
        const cleanText = text.replace(/[*#`]/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
        }
    }, [input]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        try {
            const history = messages.filter(m => m.role !== "system").map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content
            }));

            const res = await chatWithUniversalAgent(history, userMsg.content);

            if (res.success && res.reply) {
                setMessages(prev => [...prev, { role: "assistant", content: res.reply as string }]);
                if (res.roleDetected) setUserRole(res.roleDetected);
                speak(res.reply as string); // Speak response
            } else {
                toast.error("Agent failed to respond.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to connect to agent.");
        }
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="origin-bottom-right"
                    >
                        <Card className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] flex flex-col shadow-2xl border-primary/20 backdrop-blur-md bg-background/95 overflow-hidden ring-1 ring-border/50">
                            <CardHeader className={`border-b p-3 sm:p-4 ${userRole !== 'public' ? 'bg-purple-500/10' : ''}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center shadow-inner ${userRole === 'super-admin' ? 'bg-red-600 text-white' :
                                            userRole === 'admin' ? 'bg-purple-600 text-white' :
                                                'bg-linear-to-tr from-primary to-primary/80 text-primary-foreground'
                                            }`}>
                                            {userRole === 'super-admin' ? <ShieldAlert className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                {userRole === 'super-admin' ? 'System Overseer' :
                                                    userRole === 'admin' ? 'Admin Co-Pilot' :
                                                        'Tayyab.AI Agent'}
                                            </CardTitle>
                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-medium">
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                </span>
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsCallMode(true)}
                                            className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                            title="Start Live Call (Free)"
                                        >
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                            className={cn("h-8 w-8", isVoiceEnabled ? "text-primary" : "text-muted-foreground")}
                                            title={isVoiceEnabled ? "Mute TTS" : "Enable TTS"}
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setMessages([])} className="h-8 w-8 hover:bg-muted text-muted-foreground" title="Clear Chat">
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0 overflow-hidden relative flex flex-col">
                                <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 mt-8 px-6">
                                            <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mb-2">
                                                <Sparkles className="h-8 w-8 text-primary/40" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {userRole === 'public'
                                                    ? "How can I help you today?"
                                                    : "Awaiting administrative command."}
                                            </p>
                                            <p className="text-xs max-w-[200px] leading-relaxed opacity-70">
                                                Ask about skills, projects, experience, or contact info.
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-4 pb-4">
                                        {messages.map((m, i) => (
                                            <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                                {m.role === "assistant" && (
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                                                        <Bot className="h-3.5 w-3.5 text-primary" />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                                    m.role === "user"
                                                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-white rounded-tr-sm"
                                                        : "bg-muted/50 border backdrop-blur-sm rounded-tl-sm text-foreground"
                                                )}>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                                                        {m.role === 'user' ? (
                                                            m.content
                                                        ) : (
                                                            <ReactMarkdown>{m.content}</ReactMarkdown>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex gap-3">
                                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                                                    <Bot className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <div className="bg-muted/50 border rounded-2xl rounded-tl-sm px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                                    <VoiceVisualizer isListening={isListening} />
                                </div>
                            </CardContent>

                            <CardFooter className="p-3 sm:p-4 bg-background/80 border-t backdrop-blur-md">
                                <div className="relative flex items-end gap-2 w-full bg-muted/40 border rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className={cn("rounded-xl h-8 w-8 mb-0.5 shrink-0", isListening ? "text-red-500 bg-red-100 dark:bg-red-900/20" : "text-muted-foreground hover:bg-muted")}
                                        onClick={toggleListening}
                                        title="Voice Input"
                                    >
                                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground/50 min-h-[24px] max-h-[120px] resize-none text-sm py-1.5 leading-relaxed"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={() => handleSend()}
                                        size="icon"
                                        disabled={!input.trim() || isLoading}
                                        className={cn(
                                            "h-8 w-8 rounded-xl transition-all shadow-sm shrink-0 mb-0.5",
                                            input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="h-14 w-14 rounded-full shadow-2xl border-2 border-background/20 hover:scale-110 transition-transform duration-300 bg-linear-to-tr from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-white p-0 relative"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                </span>
            </Button>

            <AnimatePresence>
                {isCallMode && <VoiceCallOverlay onClose={() => setIsCallMode(false)} />}
            </AnimatePresence>
        </div>
    );
}
