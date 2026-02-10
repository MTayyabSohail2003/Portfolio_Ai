import { openai, AI_MODELS } from "./provider";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import FinanceCategory from "@/lib/db/models/finance/FinanceCategory"; // Ensure this import path is correct

const CategoryPredictionSchema = z.object({
  categoryName: z
    .string()
    .describe("The best matching category name from the provided list."),
  confidence: z.number().describe("Confidence score between 0 and 1"),
  reasoning: z.string().describe("Why this category was chosen"),
  isNewCategory: z
    .boolean()
    .describe(
      "True if no existing category fits well and a new one is suggested"
    ),
  suggestedColor: z
    .string()
    .optional()
    .describe("Hex code for new category if suggested"),
});

export async function predictCategory(description: string, userId: string) {
  try {
    // 1. Fetch user's existing categories to guide the AI
    const categories = await FinanceCategory.find({ userId })
      .select("name type")
      .lean();
    const categoryList = categories
      .map((c: any) => `${c.name} (${c.type})`)
      .join(", ");

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content: `You are an expert financial bookkeeper. Categorize the transaction description into one of the user's existing categories. 
          
          Existing Categories: [${categoryList}]
          
          If the description clearly doesn't fit any existing category, suggest a standard generic one (e.g., "Food", "Transport", "Utilities", "Shopping").
          `,
        },
        { role: "user", content: `Transaction Description: "${description}"` },
      ],
      response_format: zodResponseFormat(
        CategoryPredictionSchema,
        "category_prediction"
      ),
    });

    const prediction = (completion.choices[0].message as any).parsed;
    return prediction;
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return null;
  }
}
