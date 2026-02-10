import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt, context } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let systemPrompt = `You are a professional content strategist.`;

    if (context?.type === "blog_post") {
      const { tone, length, format } = context.config || {};
      systemPrompt = `You are an expert technical writer and storyteller.
      
      TASK: Write a ${tone || "professional"} blog post.
      FORMAT: ${format === "markdown" ? "Standard Markdown Article" : format}.
      LENGTH: Approximately ${length || 1000} words.
      
      GUIDELINES:
      - Use H2 and H3 headers for structure.
      - Use code blocks for technical concepts if applicable.
      - Use blockquotes for emphasis.
      - Tone should be ${tone}.
      - Output ONLY the markdown content.
      
      CONTEXT FROM ADMIN:
      ${JSON.stringify(context.title ? { title: context.title } : {}, null, 2)}
      
      USER INSTRUCTIONS: ${prompt}`;
    } else {
      // Default fallback for other uses (resume, summary etc)
      systemPrompt = `You are a professional resume writer and content strategist. 
       Your task is to write a compelling, professional, and concise description based on the provided context.
       
       Context:
       ${JSON.stringify(context, null, 2)}
       
       User Prompt: ${prompt}
       
       Output Format:
       Return ONLY the generated text. Do not include quotes or "Here is the description".
       Use professional tone, active verbs, and quantify results where possible.
       If the context implies a list, use bullet points (markdown).`;
    }

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
