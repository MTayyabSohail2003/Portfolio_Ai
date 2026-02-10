import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Promise<string[]> {
  if (!text) return [];

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: overlap,
    separators: ["\n\n", "\n", ".", "?", "!", " ", ""],
  });

  return await splitter.splitText(text);
}
