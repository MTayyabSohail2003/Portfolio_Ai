"use client";

import { useState, useRef, useCallback } from "react";

export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<
    "idle" | "streaming" | "submitted" | "error"
  >("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = async (userMessage: {
    role: string;
    content: string;
  }) => {
    setStatus("submitted");

    // Optimistic Update
    const newMessages = [
      ...messages,
      { ...userMessage, id: Date.now().toString() },
    ];
    setMessages(newMessages);

    try {
      const ac = new AbortController();
      abortControllerRef.current = ac;

      setStatus("streaming");

      // Add placeholder assistant message
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "" },
      ]);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: ac.signal,
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        assistantContent += text;

        // Update the last message (assistant) with accumulated text
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.id === assistantMsgId) {
            last.content = assistantContent;
          }
          return updated;
        });
      }

      setStatus("idle");
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Chat Error:", error);
        setStatus("error");
        // Optionally remove the failed assistant message or show error state
      }
    }
  };

  const regenerate = () => {
    // Simplistic regeneration: remove last assistant message and resend last user message
    // Not fully implemented for this simplified hook but defined for compatibility
    console.warn("Regenerate not fully implemented in manual hook");
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus("idle");
    }
  };

  return {
    messages,
    setMessages,
    sendMessage,
    status,
    regenerate,
    stop,
  };
}
