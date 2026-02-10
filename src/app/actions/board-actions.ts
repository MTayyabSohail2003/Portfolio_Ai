"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Task from "@/lib/db/models/task-management/Task";
import Board from "@/lib/db/models/task-management/Board";
import { revalidatePath } from "next/cache";

// --- AI HELPERS ---
// Mocking AI for now, or using a real provider if configured.
// Ideally usage of Google Generative AI here.

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateTaskTags(taskTitle: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      // Fallback logic if no key
      const tags = [];
      if (taskTitle.toLowerCase().includes("bug")) tags.push("Bug");
      if (taskTitle.toLowerCase().includes("urgent"))
        tags.push("High Priority");
      if (taskTitle.toLowerCase().includes("design")) tags.push("Design");
      return tags;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze this task title: "${taskTitle}". Suggest up to 3 short tags (e.g. Bug, Feature, Urgent, DevOps, Design). Return ONLY a JSON array of strings. Example: ["Bug", "High Priority"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // clean up markdown code block if present
    const jsonStr = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("AI Tag Gen Error", e);
    return ["New"];
  }
}

// --- TASKS ---

export async function createTask(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const boardId = formData.get("boardId") as string;
    const columnId = formData.get("columnId") as string;

    if (!title || !boardId || !columnId) return { error: "Missing fields" };

    await dbConnect();

    // Auto-Tagging Hook
    const aiTags = await generateTaskTags(title);

    // Get highest order to append
    const lastTask = await Task.findOne({ boardId, columnId }).sort({
      order: -1,
    });
    const order = lastTask ? lastTask.order + 1000 : 1000;

    const newTask = await Task.create({
      title,
      boardId,
      columnId,
      order,
      assignee: session.user.id,
      aiTags,
    });

    revalidatePath(`/admin/boards/${boardId}`);
    return { success: true, task: JSON.parse(JSON.stringify(newTask)) };
  } catch (error) {
    console.error("Create Task Error:", error);
    return { error: "Failed to create task" };
  }
}

export async function updateTaskOrder(
  taskId: string,
  newColumnId: string,
  newOrder: number,
  boardId: string
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    await dbConnect();

    await Task.findByIdAndUpdate(taskId, {
      columnId: newColumnId,
      order: newOrder,
    });

    revalidatePath(`/admin/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    console.error("Move Task Error:", error);
    return { error: "Failed to move task" };
  }
}

export async function deleteTask(taskId: string, boardId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    await dbConnect();
    await Task.findByIdAndDelete(taskId);

    revalidatePath(`/admin/boards/${boardId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete task" };
  }
}

// --- BOARDS ---

export async function getBoardData(boardId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { error: "Unauthorized" };

    await dbConnect();
    const board = await Board.findById(boardId).lean();
    if (!board) return { error: "Board not found" };

    const tasks = await Task.find({ boardId }).sort({ order: 1 }).lean();

    // Organize tasks by column
    const populatedColumns = board.columns.map((col: any) => ({
      ...col,
      tasks: tasks.filter((t: any) => t.columnId === col.id),
    }));

    return {
      board: {
        ...JSON.parse(JSON.stringify(board)),
        columns: populatedColumns,
      },
    };
  } catch (error) {
    console.error("Get Board Error:", error);
    return { error: "Failed to fetch board" };
  }
}
