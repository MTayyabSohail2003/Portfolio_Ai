import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { admin, magicLink } from "better-auth/plugins";
import nodemailer from "nodemailer";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables.");
}

const client = new MongoClient(uri);
const db = client.db();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      adminRole: ["admin", "super-admin"],
      defaultRole: "user",
    }),
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string, url: string }) => {
        console.log("Sending magic link to:", email);
        try {
          await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || "Portfolio Admin"}" <${process.env.EMAIL_SERVER_USER}>`,
            to: email,
            subject: "Sign in to Portfolio Admin",
            text: `Click the link to sign in: ${url}`,
            html: `<a href="${url}">Sign in to Portfolio Admin</a>`,
          });
          console.log("Magic link sent successfully");
        } catch (error) {
          console.error("Failed to send magic link email:", error);
          throw new Error("Failed to send email");
        }
      },
    }),
  ],
});
