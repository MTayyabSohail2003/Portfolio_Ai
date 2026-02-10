import nodemailer from "nodemailer";
import Contact from "@/lib/db/models/Contact";
import dbConnect from "@/lib/db/connect";

async function checkRateLimit(email: string): Promise<boolean> {
  await dbConnect();
  const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
  const recentContact = await Contact.findOne({
    email: email,
    createdAt: { $gte: seventyTwoHoursAgo },
  });
  return !!recentContact;
}

export async function sendEmail({
  email,
  subject,
  message,
  name,
}: {
  email: string; // The sender's email
  subject: string;
  message: string;
  name: string;
}) {
  console.log(`[Email Service] Processing email from ${name} (${email})...`);

  // 1. Rate Limit Check
  const isRateLimited = await checkRateLimit(email);
  if (isRateLimited) {
    console.warn(`[Email Service] Rate limit exceeded for ${email}`);
    return {
      success: false,
      message:
        "Rate limit exceeded. You can only send one message every 72 hours.",
    };
  }

  // 2. Configure Recipient (Always Admin)
  const to = process.env.ADMIN_EMAIL || "mtayyabsohail8@gmail.com";

  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.warn("[Email Service] Credentials not found. Mocking success.");
    return {
      success: true,
      message:
        "Email simulation: Message sent successfully (Credentials missing).",
    };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    // 3. Send Email
    const info = await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_SERVER_USER}>`, // Sent via our server, but indicating sender name
      replyTo: email, // Set Reply-To to the user's email
      to,
      subject: `[AI Agent] ${subject}`, // Prefix subject
      text: `Message from ${name} (${email}):\n\n${message}`,
    });
    console.log("[Email Service] Sent:", info.messageId);

    // 4. Log to DB
    await Contact.create({
      name,
      email,
      subject: `[AI Agent] ${subject}`,
      message,
    });

    return { success: true, message: "Email sent successfully." };
  } catch (error: any) {
    console.error("[Email Service] Error:", error);
    return {
      success: false,
      message: `Failed to send email: ${error.message}`,
    };
  }
}
