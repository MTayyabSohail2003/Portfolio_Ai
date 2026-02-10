"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Board from "@/lib/db/models/task-management/Board";
import Task from "@/lib/db/models/task-management/Task";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// --- TASKS ---

export async function createTask(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const boardId = formData.get("boardId") as string;
  const columnId = formData.get("columnId") as string;
  const priority = formData.get("priority") || "medium";
  const assigneeId = formData.get("assigneeId") as string;

  const description = formData.get("description") as string;
  const tags = formData.get("tags")
    ? JSON.parse(formData.get("tags") as string)
    : [];
  const subtasks = formData.get("subtasks")
    ? JSON.parse(formData.get("subtasks") as string)
    : [];

  if (!title || !boardId || !columnId)
    return { error: "Missing required fields" };

  try {
    // Find highest order in this column to append to bottom
    const lastTask = await Task.findOne({ boardId, columnId }).sort({
      order: -1,
    });
    const newOrder = lastTask ? lastTask.order + 1000 : 1000; // Gap for reordering

    const newTask = await Task.create({
      title,
      description,
      boardId,
      columnId,
      status: columnId, // Initially map status to columnId, though status field might be redundant if we strictly use columnId
      priority,
      order: newOrder,
      assignees: assigneeId ? [assigneeId] : [],
      tags,
      subtasks,
    });

    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true, data: JSON.parse(JSON.stringify(newTask)) };
  } catch (e) {
    console.error("Create Task Error", e);
    return { error: "Failed to create task" };
  }
}

export async function moveTask(
  taskId: string,
  newColumnId: string,
  newOrder: number,
  boardId: string
) {
  await dbConnect();
  // We can add stricter auth check here

  try {
    await Task.findByIdAndUpdate(taskId, {
      columnId: newColumnId,
      status: newColumnId, // Keep status synced
      order: newOrder,
    });

    // Optional: Normalizing orders could be done here if needed, but not strictly required for MVP

    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true };
  } catch (e) {
    return { error: "Failed to move task" };
  }
}

export async function updateTask(
  taskId: string,
  updates: any,
  boardId: string
) {
  await dbConnect();
  try {
    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });
    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true, data: JSON.parse(JSON.stringify(task)) };
  } catch (e) {
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(taskId: string, boardId: string) {
  await dbConnect();
  try {
    await Task.findByIdAndDelete(taskId);
    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete task" };
  }
}

// --- BOARDS ---

export async function getBoardData(boardId: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const board = await Board.findById(boardId).populate("workspaceId").lean();
    if (!board) return { error: "Board not found" };

    const tasks = await Task.find({ boardId })
      .sort({ order: 1 })
      .populate("assignees", "name image")
      .lean();

    // Separate tasks by columnId for easier UI consumption?
    // Or just return flat list and let UI handle it (better for dnd-kit)

    return {
      success: true,
      board: JSON.parse(JSON.stringify(board)),
      tasks: JSON.parse(JSON.stringify(tasks)),
    };
  } catch (e) {
    return { error: "Failed to fetch board data" };
  }
}

export async function updateBoardColumns(boardId: string, columns: any[]) {
  await dbConnect();
  try {
    await Board.findByIdAndUpdate(boardId, { columns });
    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true };
  } catch (e) {
    return { error: "Failed to update columns" };
  }
}

// ... (existing imports, add this one)
import { enrichTaskAI } from "@/lib/ai/tasks";

// ... (existing code)

export async function createColumn(boardId: string, title: string) {
  await dbConnect();
  try {
    const board = await Board.findById(boardId);
    if (!board) return { error: "Board not found" };

    const newId = new mongoose.Types.ObjectId().toString(); // Generate ID
    const newColumn = {
      id: newId,
      title,
      order: board.columns.length * 1000,
      type: "custom",
    };

    board.columns.push(newColumn);
    await board.save();

    revalidatePath(`/admin/workspaces/${boardId}/board`);
    return { success: true };
  } catch (e) {
    return { error: "Failed to create column" };
  }
}

export async function aiEnrichTask(taskId: string, boardId: string) {
  await dbConnect();
  try {
    const task = await Task.findById(taskId);
    if (!task) return { error: "Task not found" };

    const enrichment = await enrichTaskAI(task.title, task.description || "");
    if (!enrichment) return { error: "AI failed to process" };

    const updates: any = {
      aiTags: enrichment.tags,
    };

    // If subtasks are empty, populate them
    if (
      enrichment.subtasks &&
      enrichment.subtasks.length > 0 &&
      (!task.subtasks || task.subtasks.length === 0)
    ) {
      updates.subtasks = enrichment.subtasks;
    }

    await Task.findByIdAndUpdate(taskId, updates);
    revalidatePath(`/admin/workspaces/${boardId}/board`);

    return { success: true, data: enrichment };
  } catch (e) {
    return { error: "Enrichment failed" };
  }
}

export async function generateTaskAIProposal(
  title: string,
  description: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const enrichment = await enrichTaskAI(title, description);
  if (!enrichment) return { error: "AI failed to process" };

  return { success: true, data: enrichment };
}
