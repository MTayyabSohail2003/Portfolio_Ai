import { openai, AI_MODELS } from "./provider";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const TaskEnrichmentSchema = z.object({
  tags: z
    .array(z.string())
    .describe("A list of 3-5 relevant tags for the task"),
  summary: z.string().describe("A concise 1-sentence summary of the task"),
  subtasks: z
    .array(
      z.object({
        title: z.string(),
        completed: z.boolean().default(false),
      })
    )
    .describe(
      "Suggested subtasks to break down this work, if applicable. Max 5."
    ),
});

export async function enrichTaskAI(title: string, description: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content: `You are an expert Project Manager. Analyze the task title and description.
          1. Generate relevant tags (e.g. "Bug", "Frontend", "Refactor", "High Priority").
          2. Create a concise summary.
          3. Suggest breakdown subtasks if the task is complex.
          `,
        },
        {
          role: "user",
          content: `Task Title: "${title}"\nDescription: "${description}"`,
        },
      ],
      response_format: zodResponseFormat(
        TaskEnrichmentSchema,
        "task_enrichment"
      ),
    });

    const prediction = (completion.choices[0].message as any).parsed;
    return prediction;
  } catch (error) {
    console.error("AI Task Enrichment Error:", error);
    return null;
  }
}
