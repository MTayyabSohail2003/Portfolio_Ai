import { embedText } from "./embeddings";
import { searchVectors } from "./vector-store";

export async function retrieveContext(query: string) {
  // 1. Convert user query to vector
  const embedding = await embedText(query);

  // 2. Search for relevant content
  const matches = await searchVectors(embedding, 4); // Fetch top 4 chunks

  // 3. Format matches into a readable string block
  const contextBlock = matches
    .filter((match) => match.score && match.score > 0.3) // Filter low relevance
    .map((match) => match.metadata?.text)
    .filter(Boolean)
    .join("\n\n---\n\n");

  return contextBlock;
}
