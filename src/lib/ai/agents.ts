import { openai, AI_MODELS } from "./provider";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dbConnect from "@/lib/db/connect";
import Task from "@/lib/db/models/task-management/Task";

// --- TOOLS ---

const SaveTasksSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]),
      type: z.enum(["Bug", "Feature", "Design", "DevOps", "Content", "Other"]),
    })
  ),
});

async function saveTasksTool(
  args: z.infer<typeof SaveTasksSchema>,
  boardId: string,
  userId: string
) {
  await dbConnect();

  // Find "Todo" column or first column
  const tasksToCreate = [];
  const timestamp = Date.now();

  // We need columnId. For now, assume a default 'todo' or similar.
  // In a real agent, we might query the board columns first.
  // Passed simplified for now.

  const createdTasks = [];

  for (let i = 0; i < args.tasks.length; i++) {
    const t = args.tasks[i];
    // Simple auto-mapping for demo
    createdTasks.push({
      title: t.title,
      description: t.description,
      priority: t.priority,
      aiTags: [t.type],
      status: "todo",
      boardId,
      assignee: userId,
      columnId: "todo", // This should be dynamic in full implementation
      order: timestamp + i * 1000,
    });
  }

  if (createdTasks.length > 0) {
    await Task.insertMany(createdTasks);
  }

  return {
    success: true,
    count: createdTasks.length,
    message: `Created ${createdTasks.length} tasks.`,
  };
}

// --- AGENTS ---

// 1. Triage Agent
// Responsibilities: Determine if the input is actionable tasks or garbage.
// Handoffs: To "Task Builder" if tasks detected.

const TriageResponse = z.object({
  isRelevant: z.boolean(),
  reasoning: z.string(),
  handoffTo: z.enum(["task_builder", "none"]),
});

// 2. Task Builder Agent
// Responsibilities: Parse input into structured JSON.

export async function runBulkTaskAgent(
  prompt: string,
  boardId: string,
  userId: string
) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "Gemini API Key not configured." };
  }

  try {
    // --- STEP 1: TRIAGE ---
    const triageCompletion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content:
            "You are a Triage Agent. Analyze the user input. If it contains requests for software tasks, bugs, or features, handoff to 'task_builder'. If it's gibberish or unrelated, output 'none'.",
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(TriageResponse, "triage_response"),
    });

    const triage = (triageCompletion.choices[0].message as any).parsed;

    if (!triage?.isRelevant || triage.handoffTo === "none") {
      return {
        success: false,
        message:
          "Input didn't appear to contain valid tasks. Reason: " +
          triage?.reasoning,
      };
    }

    // --- STEP 2: TASK BUILDER ---
    const builderCompletion = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: [
        {
          role: "system",
          content:
            "You are an expert PM. valid priorities: low, medium, high. valid types: Bug, Feature, Design, DevOps, Content, Other. Extract tasks from the input.",
        },
        { role: "user", content: prompt },
      ],
      response_format: zodResponseFormat(SaveTasksSchema, "save_tasks"),
    });

    const tasksData = (builderCompletion.choices[0].message as any).parsed;

    if (!tasksData) {
      return { success: false, message: "Failed to parse tasks." };
    }

    // --- STEP 3: TOOL EXECUTION (Implicit here, usually Agent loop) ---
    const toolResult = await saveTasksTool(tasksData, boardId, userId);

    return {
      success: true,
      count: toolResult.count,
      message: toolResult.message,
      tasks: tasksData.tasks,
    };
  } catch (error) {
    console.error("Agent Error:", error);
    return { error: "Agent process failed." };
  }
}
