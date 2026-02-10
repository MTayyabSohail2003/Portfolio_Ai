import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/services/email";
import { z } from "zod";
import dbConnect from "@/lib/db/connect";
import Contact from "@/lib/db/models/Contact";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Connect to DB and save valid message immediately to prevent data loss
    await dbConnect();
    await Contact.create({
      name,
      email,
      subject,
      message,
      read: false,
    });

    // Send email to Admin
    const emailResult = await sendEmail({
      email, // The sender's email
      subject: `[Portfolio Contact] ${subject}`,
      message: `From: ${name} (${email})\n\nMessage:\n${message}`,
      name,
    });

    if (!emailResult.success) {
      console.warn(
        "Contact email failed to send, but message saved to DB:",
        emailResult.message
      );
      // We still return success to the client because we saved their message
      return NextResponse.json({
        success: true,
        message:
          "Message received! (Email notification pending caused by system load, but your message is safe)",
      });
    }

    return NextResponse.json({ success: true, message: "Message sent!" });
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
