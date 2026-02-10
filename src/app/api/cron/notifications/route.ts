import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Task from "@/lib/db/models/task-management/Task";
import User from "@/lib/db/models/User";
import nodemailer from "nodemailer";

// Ensure DB connection
const uri = process.env.MONGODB_URI;
if (mongoose.connection.readyState === 0 && uri) {
  mongoose.connect(uri);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Find tasks due within the next 24 hours that are not 'done'
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // We need to look up column IDs that correspond to "done" status if we were strict,
    // but for now let's assume we filter by filtering logic or column type if we had populated it.
    // Simplifying: Just find tasks with due date in range.

    const tasks = await Task.find({
      dueDate: {
        $gte: new Date(),
        $lt: tomorrow,
      },
    });

    let sentCount = 0;

    for (const task of tasks) {
      if (!task.assigneeId) continue;

      const user = await User.findById(task.assigneeId);
      if (!user || !user.email) continue;

      await transporter.sendMail({
        from: process.env.EMAIL_SERVER_USER,
        to: user.email,
        subject: `Task Due Soon: ${task.title}`,
        text: `Hi ${user.name},\n\nThe task "${
          task.title
        }" is due on ${new Date(
          task.dueDate
        ).toLocaleDateString()}.\n\nPlease update the status accordingly.\n\nBest,\nTask System`,
      });
      sentCount++;
    }

    return NextResponse.json({ success: true, emailsSent: sentCount });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
