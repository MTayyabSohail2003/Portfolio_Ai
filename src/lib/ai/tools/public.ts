import { z } from "zod";
import { searchVectors } from "@/lib/ai/vector-store";
import { zodResponseFormat } from "openai/helpers/zod";

// --- SCHEMAS ---

export const SearchPortfolioSchema = z.object({
  query: z
    .string()
    .describe(
      "The user's question or topic to search for in the portfolio context."
    ),
});

// --- TOOLS DEFINITION ---

export const publicTools = [
  {
    type: "function",
    function: {
      name: "search_portfolio",
      description:
        "Search the portfolio for projects, experience, blogs, and skills. Use this for ANY question about Muhammad Tayyab's background.",
      parameters: zodResponseFormat(SearchPortfolioSchema, "search_portfolio")
        .json_schema,
    },
  },
  {
    type: "function",
    function: {
      name: "get_contact_info",
      description: "Get Muhammad Tayyab's contact information and social links.",
      parameters: zodResponseFormat(z.object({}), "get_contact_info")
        .json_schema,
    },
  },
];

// --- IMPLEMENTATION ---

export async function handlePublicTools(name: string, args: any) {
  if (name === "search_portfolio") {
    const { query } = args;

    if (!query) {
      return "Please provide a search query to search the portfolio.";
    }

    // We need to generate embedding first, but searchVectors expects vector.
    // In our original code, embeddings generation was separate.
    // Let's import embedText from ../embeddings
    const { embedText } = await import("@/lib/ai/embeddings");
    const vector = await embedText(query);
    const results = await searchVectors(vector);

    // Format results
    return results
      .map(
        (r) =>
          `[${(r.metadata?.type as string)?.toUpperCase() || "UNKNOWN"}] ${r.metadata?.title || "Context"
          }: ${r.metadata?.text}`
      )
      .join("\n\n");
  }

  if (name === "get_contact_info") {
    return `
      Email: mtayyabsohail8@gmail.com
      Phone: +92 309 1165807
      LinkedIn: linkedin.com/in/tayyab-sohaildev
      Location: Faisalabad, Punjab, Pakistan
      Always suggest using the Contact Form on the website for formal inquiries.
      `;
  }

  return null;
}
