"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Task from "@/lib/db/models/task-management/Task";
import { openai, AI_MODELS } from "@/lib/ai/provider";

export async function generateDailyStandup(boardId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    if (process.env.ENABLE_AI_STANDUP !== "true") {
      return { error: "AI Standup feature is disabled." };
    }

    await dbConnect();

    // 1. Fetch "Done" tasks from last 24h
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentTasks = await Task.find({
      boardId,
      updatedAt: { $gte: oneDayAgo },
    }).lean();

    if (recentTasks.length === 0) {
      return { summary: "No activity recorded in the last 24 hours." };
    }

    // 2. Format for AI
    const taskList = recentTasks
      .map((t: any) => `- [${t.columnId}] ${t.title}`)
      .join("\n");

    // 3. Generate Summary
    if (!process.env.GEMINI_API_KEY) {
      return {
        summary:
          "Simulated Standup:\n" +
          taskList +
          "\n(Configure Gemini Key for AI summary)",
      };
    }

    const completion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content:
            "You are an Agile Coach. Generate a concise daily standup summary (Yesterday's accomplishments) based on the task list. Group by context. Keep it professional.",
        },
        { role: "user", content: `Tasks updated in last 24h:\n${taskList}` },
      ],
    });

    return { summary: completion.choices[0].message.content };
  } catch (error) {
    console.error("Standup Error:", error);
    return { error: "Failed to generate standup." };
  }
}
