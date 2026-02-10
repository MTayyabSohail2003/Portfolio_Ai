import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Workspace from "@/lib/db/models/task-management/Workspace";
import User from "@/lib/db/models/User";
import Invitation from "@/lib/db/models/task-management/Invitation";

export async function POST(req: Request) {
    try {
        const { token, userEmail } = await req.json(); // userEmail is passed from the client session

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        await dbConnect();

        // 1. Find Invitation
        const invitation = await Invitation.findOne({ token });
        if (!invitation) {
            return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
        }

        // 2. Check if expired
        if (new Date() > invitation.expiresAt) {
            return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
        }

        // 3. Find User (Must be logged in to accept)
        // We expect the frontend to handle auth check, but we verify the user exists here
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ error: "User not identified" }, { status: 401 });
        }

        // 4. Verify email match (Optional: depends on if we want to allow forwarding invites)
        // For security, strict matching is better
        if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
            return NextResponse.json({ error: `This invitation is for ${invitation.email}, but you are logged in as ${user.email}.` }, { status: 403 });
        }

        // 5. Find Workspace
        const workspace = await Workspace.findById(invitation.workspaceId);
        if (!workspace) {
            return NextResponse.json({ error: "Workspace no longer exists" }, { status: 404 });
        }

        // 6. Add Member (Idempotent check)
        const isMember = workspace.members.some(
            (m: any) => m.userId.toString() === user._id.toString()
        );

        if (!isMember) {
            workspace.members.push({
                userId: user._id.toString(),
                role: invitation.role,
            });
            await workspace.save();
        }

        // 7. Delete Invitation
        await Invitation.deleteOne({ _id: invitation._id });

        return NextResponse.json({ success: true, workspaceId: workspace._id });

    } catch (error: any) {
        console.error("Join Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
