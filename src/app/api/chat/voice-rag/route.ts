import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { openai as googleOpenai, AI_MODELS } from "@/lib/ai/provider"; // Official Node SDK client
import { searchVectors } from "@/lib/ai/vector-store";

export const maxDuration = 30;

// Configure Vercel AI SDK to use Google's OpenAI-compatible endpoint for Streaming Chat
const googleAIProxy = createOpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  const { messages }: { messages: any[] } = await req.json();
  const lastUserMessage = messages[messages.length - 1];

  // 1. Embed and Search using our existing Google Client (Node SDK)
  // Note: We use the official SDK for embeddings as vector-store logic is built around it
  const embedding = await googleOpenai.embeddings.create({
    model: AI_MODELS.embedding,
    input:
      typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : "",
  });

  const vector = embedding.data[0].embedding;
  const context = await searchVectors(vector, 3);

  const contextBlock = context
    .map(
      (c) =>
        `[${c.metadata?.type || "info"}] ${c.metadata?.text || ""} (Source: ${c.metadata?.title || "Unknown"
        })`
    )
    .join("\n\n");

  // 2. Stream Response using Vercel AI SDK (for smooth frontend streaming)
  const result = await streamText({
    model: googleAIProxy(AI_MODELS.chat),
    messages,
    system: `
      You are Muhammad Tayyab's Voice AI Assistant. 
      You are currently in a LIVE PHONE CALL with a user.
      
      YOUR GOAL: Answer quickly and concisely based on the context.
      
      RULES:
      1. Speak naturally, as if talking on the phone.
      2. SENTENCE LENGTH: Keep sentences short (max 10-15 words). This reduces voice latency.
      3. FORMATTING: DO NOT use markdown, asterisks, hyphens, or code blocks. Plain text only.
      4. CONTENT: Use the provided context to answer. If you don't know, say "I'm not sure about that detail."
      5. TONE: Professional, warm, and confident.
      
      CONTEXT:
      ${contextBlock}
    `,
  });

  return result.toTextStreamResponse();
}
