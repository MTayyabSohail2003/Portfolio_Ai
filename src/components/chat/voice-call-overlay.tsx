
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";

interface VoiceCallOverlayProps {
    onClose: () => void;
}

export function VoiceCallOverlay({ onClose }: VoiceCallOverlayProps) {
    const [isListening, setIsListening] = useState(true);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);

    // Vercel AI SDK
    const { messages, append, isLoading, stop } = useChat({
        api: "/api/chat/voice-rag",
        onFinish: () => {
            // Re-activate mic after AI finishes speaking
        },
    } as any) as any;

    // TTS Buffer State
    const [speaking, setSpeaking] = useState(false);
    const synthesisQueue = useRef<string[]>([]);
    const lastSpokenIndex = useRef(0);
    const processingBuffer = useRef("");

    // 1. Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false; // We want turn-taking
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const result = event.results[current];
                    const text = result[0].transcript;

                    setTranscript(text);

                    if (result.isFinal) {
                        setIsListening(false);
                        setTranscript("");
                        append({ role: "user", content: text });
                    }
                };

                recognitionRef.current.onend = () => {
                    if (!speaking && !isLoading) {
                        // Only restart if not processing/speaking
                        // Manual toggle handling preferred for clean UX
                        setIsListening(false);
                    }
                };
            }
        }

        // Cleanup
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            window.speechSynthesis.cancel();
        };
    }, []);

    // 2. Stream Processing & TTS (The "Sentence Buffer")
    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
        if (lastMessage?.role === "assistant") {
            const content = lastMessage.content;
            const newContent = content.slice(lastSpokenIndex.current);
            processingBuffer.current += newContent;
            lastSpokenIndex.current = content.length;

            // Detect sentence boundaries
            const sentences = processingBuffer.current.match(/[^.!?]+[.!?]+/g);

            if (sentences) {
                sentences.forEach((sentence: string) => {
                    speak(sentence.trim());
                    processingBuffer.current = processingBuffer.current.replace(sentence, "");
                });
            }
        }
    }, [messages]);


    const speak = (text: string) => {
        setSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster for conversational feel

        utterance.onend = () => {
            // Small delay to prevent overlap
            setTimeout(() => {
                if (!window.speechSynthesis.speaking) {
                    setSpeaking(false);
                    // Auto-listen reply
                    if (recognitionRef.current && !isLoading) {
                        try {
                            recognitionRef.current.start();
                            setIsListening(true);
                        } catch (e) { }
                    }
                }
            }, 200);
        };

        window.speechSynthesis.speak(utterance);
    };

    const toggleMic = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            window.speechSynthesis.cancel(); // Stop talking if user interrupts
            processingBuffer.current = "";
            lastSpokenIndex.current = 0;
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) { }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
            {/* Pulsing Orb */}
            <div className="relative mb-12">
                <motion.div
                    className="w-32 h-32 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600 blur-xl opacity-50"
                    animate={{
                        scale: (isListening || isLoading || speaking) ? [1, 1.2, 1] : 1,
                        opacity: (isListening) ? 0.8 : (speaking) ? 0.6 : 0.3
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-0 w-32 h-32 rounded-full border-2 border-cyan-500/50 flex items-center justify-center"
                    animate={{
                        rotate: isLoading ? 360 : 0
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <User className="w-12 h-12 text-cyan-200" />
                </motion.div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-4 max-w-md h-32">
                <h2 className="text-2xl font-light text-cyan-100/90">
                    {isListening ? "Listening..." : speaking ? "Tayyab AI Speaking..." : isLoading ? "Thinking..." : "Tap to Speak"}
                </h2>
                <p className="text-lg text-cyan-400/80 font-mono">
                    {transcript || (speaking ? "..." : "")}
                </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-8 mt-12">
                <Button
                    size="lg"
                    variant="outline"
                    className={`h-16 w-16 rounded-full border-2 ${isListening ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-cyan-500/50 text-cyan-400'}`}
                    onClick={toggleMic}
                >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                    onClick={onClose}
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </motion.div>
    );
}
