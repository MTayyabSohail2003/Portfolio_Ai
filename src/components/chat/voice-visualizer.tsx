
"use client";

import { motion } from "framer-motion";

export function VoiceVisualizer({ isListening }: { isListening: boolean }) {
  if (!isListening) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-8 w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-primary rounded-full"
          animate={{
            height: [10, 24, 10],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="ml-2 text-xs font-medium text-primary animate-pulse">
        Listening...
      </span>
    </div>
  );
}
