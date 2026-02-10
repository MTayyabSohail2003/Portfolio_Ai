import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Workspace from "@/lib/db/models/task-management/Workspace";
import User from "@/lib/db/models/User";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { workspaceId, email, role, name } = await req.json();

        if (!workspaceId || !email) {
            return NextResponse.json(
                { error: "Workspace ID and Email are required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // 1. Check if workspace exists
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return NextResponse.json(
                { error: "Workspace not found" },
                { status: 404 }
            );
        }

        // 2. Find User
        let user = await User.findOne({ email });

        // 3. Handle User Not Found
        if (!user) {
            if (!name) {
                return NextResponse.json(
                    { error: "User not found. Please provide a name to create them.", code: "USER_NOT_FOUND" },
                    { status: 404 }
                );
            }

            // Create new user if name is provided
            user = await User.create({
                name,
                email,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                role: "user",
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            });
        }

        // 4. Add to Workspace (Idempotent)
        const isMember = workspace.members.some(
            (m: any) => m.userId.toString() === user._id.toString()
        );

        if (isMember) {
            return NextResponse.json(
                { error: "User is already a member of this workspace" },
                { status: 400 }
            );
        }

        workspace.members.push({
            userId: user._id.toString(),
            role: role || "viewer",
        });
        await workspace.save();

        // 5. Send Welcome Email
        if (process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            await transporter.sendMail({
                from: `"Project Workspace" <${process.env.EMAIL_SERVER_USER}>`,
                to: email,
                subject: `You have been added to ${workspace.name}`,
                text: `Hello ${user.name},\n\nYou have been added to the workspace "${workspace.name}" as a ${role || "viewer"}.\n\nLog in to collaborate: ${appUrl}/auth/login`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to ${workspace.name}!</h2>
            <p>You have been added to the workspace <strong>${workspace.name}</strong> as a <strong>${role || "viewer"}</strong>.</p>
            <p style="margin: 24px 0;">
              <a href="${appUrl}/auth/login" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Log In</a>
            </p>
            <p style="color: #666; font-size: 14px;">If you don't have a password yet, please use the "Forgot Password" or "Sign in with Google" option.</p>
          </div>
        `
            });
        }

        return NextResponse.json({ success: true, message: "Member added successfully" });
    } catch (error: any) {
        console.error("Invite Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
