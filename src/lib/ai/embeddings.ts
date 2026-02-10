import { genAI, AI_MODELS } from "./provider";

export async function embedText(text: string): Promise<number[]> {
  try {
    if (!text) {
      throw new Error("Text is required for embedding generation");
    }

    // Use native Google Generative AI SDK for embeddings
    const model = genAI.getGenerativeModel({ model: AI_MODELS.embedding });

    const result = await model.embedContent(text.replace(/\n/g, " ")); // Clean newlines

    return result.embedding.values;
  } catch (error) {
    console.error("Embedding Generation Failed:", error);
    throw new Error("Failed to generate embedding");
  }
}
