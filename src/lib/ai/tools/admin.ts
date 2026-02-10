import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dbConnect from "@/lib/db/connect";
import Project from "@/lib/db/models/Project"; // Assuming model exists
import Blog from "@/lib/db/models/Blog"; // Assuming model exists
import Task from "@/lib/db/models/task-management/Task";

// --- SCHEMAS ---

const ManageTaskSchema = z.object({
  action: z.enum(["create", "list", "complete"]),
  title: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
});

const QueryContentSchema = z.object({
  type: z.enum(["project", "blog"]),
  action: z.enum(["list", "count"]),
});

// --- TOOLS ---

export const adminTools = [
  {
    type: "function",
    function: {
      name: "manage_tasks",
      description: "Manage workspace tasks. Create, list, or update tasks.",
      parameters: zodResponseFormat(ManageTaskSchema, "manage_tasks")
        .json_schema,
    },
  },
  {
    type: "function",
    function: {
      name: "query_content",
      description:
        "Query CMS content (Projects, Blogs). Useful for checking status of content.",
      parameters: zodResponseFormat(QueryContentSchema, "query_content")
        .json_schema,
    },
  },
];

// --- IMPLEMENTATION ---

export async function handleAdminTools(name: string, args: any) {
  await dbConnect();

  if (name === "manage_tasks") {
    if (args.action === "list") {
      const tasks = await Task.find().limit(10).sort({ createdAt: -1 });
      return JSON.stringify(
        tasks.map((t: any) => ({ id: t._id, title: t.title, status: t.status }))
      );
    }
    if (args.action === "create" && args.title) {
      const newTask = await Task.create({
        title: args.title,
        status: args.status || "todo",
        priority: "medium",
        order: 0,
      });
      return `Created Task: ${newTask.title} (ID: ${newTask._id})`;
    }
    if (args.action === "complete" && args.title) {
      // naive title match for now, or ID if provided
      // In real usage, agent might ask for ID. Let's try to match by loose title or ID
      let task = await Task.findById(args.title).catch(() => null);
      if (!task) {
        task = await Task.findOne({
          title: { $regex: args.title, $options: "i" },
        });
      }

      if (task) {
        task.status = "done";
        await task.save();
        return `Marked task '${task.title}' as Done.`;
      }
      return "Task not found.";
    }
  }

  if (name === "query_content") {
    const Model = args.type === "project" ? Project : Blog;
    if (args.action === "count") {
      const count = await Model.countDocuments();
      return `Total ${args.type}s: ${count}`;
    }
    if (args.action === "list") {
      const items = await Model.find()
        .select("title slug status")
        .limit(5)
        .sort({ createdAt: -1 });
      return JSON.stringify(items);
    }
  }

  return null;
}
