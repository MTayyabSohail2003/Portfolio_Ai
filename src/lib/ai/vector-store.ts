import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX || "portfolio");

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    text: string;
    type: "project" | "experience" | "blog" | "general" | "core_context";
    title?: string;
    url?: string;
    [key: string]: any;
  };
}

export async function saveVector(record: VectorRecord) {
  try {
    await index.upsert([record]);
    return true;
  } catch (error) {
    console.error("Vector Save Error:", error);
    return false;
  }
}

export async function searchVectors(vector: number[], topK: number = 3) {
  try {
    const result = await index.query({
      vector,
      topK,
      includeMetadata: true,
    });
    return result.matches;
  } catch (error) {
    console.error("Vector Search Error:", error);
    return [];
  }
}

export async function getIndexStats() {
  try {
    const stats = await index.describeIndexStats();
    return stats;
  } catch (error) {
    console.error("Vector Stats Error:", error);
    return null;
  }
}

export async function deleteAllVectors() {
  try {
    await index.deleteAll();
    return true;
  } catch (error: any) {
    console.error("Vector Delete All Error:", error);
    // If index or vectors not found, we consider it a success (idempotent)
    if (
      error.message?.includes("404") ||
      error.name === "PineconeNotFoundError"
    ) {
      return true;
    }
    return false;
  }
}
