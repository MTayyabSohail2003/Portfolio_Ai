import { openai, AI_MODELS } from "./provider";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const MappingSchema = z.object({
  dateColumn: z.string().describe("The header name for the transaction date"),
  descriptionColumn: z
    .string()
    .describe("The header name for the description/merchant"),
  amountColumn: z.string().describe("The header name for the amount"),
  typeColumn: z
    .string()
    .optional()
    .describe("The header name for transaction type (Debit/Credit) if exists"),
  confidence: z.number(),
});

export async function mapCsvHeaders(headers: string[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content: `You are a data mapping assistant. Analyze the provided CSV headers and map them to our schema (Date, Description, Amount).
          
          Common patterns:
          - Date: "Date", "Posting Date", "Time"
          - Description: "Description", "Merchant", "Payee", "Memo"
          - Amount: "Amount", "Value", "Cost"
          `,
        },
        { role: "user", content: `Headers: ${JSON.stringify(headers)}` },
      ],
      response_format: zodResponseFormat(MappingSchema, "csv_mapping"),
    });

    return (completion.choices[0].message as any).parsed;
  } catch (error) {
    console.error("AI Mapping Error:", error);
    return null;
  }
}
