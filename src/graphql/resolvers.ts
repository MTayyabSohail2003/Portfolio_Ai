import Workspace from "@/lib/db/models/task-management/Workspace";
import Board from "@/lib/db/models/task-management/Board";
import Column from "@/lib/db/models/task-management/Column";
import Task from "@/lib/db/models/task-management/Task";
import User from "@/lib/db/models/User";
import { auth } from "@/lib/auth"; // Access auth for session
import { headers } from "next/headers";

const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const resolvers = {
  Query: {
    workspaces: async () => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      // Find workspaces where user is owner or member
      return await Workspace.find({
        $or: [
          { owner: session.user.id },
          { "members.userId": session.user.id },
        ],
      });
    },
    workspace: async (_: any, { id }: { id: string }) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      return await Workspace.findById(id);
    },
    board: async (_: any, { id }: { id: string }) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      return await Board.findById(id);
    },
    users: async () => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      return await User.find({});
    },
  },
  Mutation: {
    createWorkspace: async (
      _: any,
      { name, description }: { name: string; description?: string }
    ) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      const workspace = await Workspace.create({
        name,
        description,
        owner: session.user.id,
        members: [{ userId: session.user.id, role: "admin" }],
      });
      return workspace;
    },
    createBoard: async (_: any, args: any) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      return await Board.create(args);
    },
    createColumn: async (_: any, args: any) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      // Auto-increment order logic could be added here
      const count = await Column.countDocuments({ boardId: args.boardId });
      return await Column.create({ ...args, order: count });
    },
    createTask: async (_: any, args: any) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      const count = await Task.countDocuments({ columnId: args.columnId });
      return await Task.create({
        ...args,
        reporterId: session.user.id,
        order: count,
      });
    },
    moveTask: async (
      _: any,
      {
        taskId,
        columnId,
        order,
      }: { taskId: string; columnId: string; order: number }
    ) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      const task = await Task.findByIdAndUpdate(
        taskId,
        { columnId, order },
        { new: true }
      );
      return task;
    },
    updateProfileImage: async (_: any, { image }: { image: string }) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      // Update user in DB
      const user = await User.findByIdAndUpdate(
        session.user.id,
        { image },
        { new: true }
      );
      return user;
    },
  },
  // Field Resolvers
  Workspace: {
    owner: async (parent: any) => await User.findById(parent.owner),
    boards: async (parent: any) => await Board.find({ workspaceId: parent.id }),
    members: async (parent: any) => {
      // Hydrate member users
      const members = parent.members || [];
      return Promise.all(
        members.map(async (m: any) => ({
          role: m.role,
          user: await User.findById(m.userId),
        }))
      );
    },
  },
  Board: {
    columns: async (parent: any) =>
      await Column.find({ boardId: parent.id }).sort({ order: 1 }),
    tasks: async (parent: any) =>
      await Task.find({ boardId: parent.id }).sort({ order: 1 }),
  },
  Column: {
    tasks: async (parent: any) =>
      await Task.find({ columnId: parent.id }).sort({ order: 1 }),
  },
  Task: {
    assignee: async (parent: any) =>
      parent.assigneeId ? await User.findById(parent.assigneeId) : null,
    reporter: async (parent: any) =>
      parent.reporterId ? await User.findById(parent.reporterId) : null,
  },
};
