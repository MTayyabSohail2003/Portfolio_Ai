import { z } from "zod";
import { sendEmail } from "@/lib/services/email";
import { bookMeeting } from "@/lib/services/calendar";

// 1. Define Zod Schemas for Validation
const sendEmailSchema = z.object({
  email: z.string().email().describe("Sender's email address"),
  name: z.string().describe("Sender's name"),
  subject: z.string().describe("Email subject"),
  message: z.string().describe("Email body content"),
});

const bookMeetingSchema = z.object({
  email: z.string().email().describe("User's email"),
  name: z.string().describe("User's name"),
  datetime: z
    .string()
    .describe("ISO 8601 Date time (e.g. 2024-05-20T10:00:00Z)"),
  topic: z.string().optional().describe("Reason for meeting"),
});

// 2. Define Tool Definitions for OpenAI API
// We manually define the JSON schema to avoid 'zod-to-json-schema' dependency if not needed,
// but matching the Zod schema above.
export const tools = [
  {
    type: "function",
    function: {
      name: "sendEmail",
      description: "Send an email to Muhammad Tayyab. Requires sender's details.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Sender's email address" },
          name: { type: "string", description: "Sender's name" },
          subject: { type: "string", description: "Email subject" },
          message: { type: "string", description: "Email body content" },
        },
        required: ["email", "name", "subject", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bookMeeting",
      description: "Book a meeting/consultation on Muhammad Tayyab's calendar.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "User's email" },
          name: { type: "string", description: "User's name" },
          datetime: {
            type: "string",
            description: "ISO 8601 Date time (e.g. 2024-05-20T10:00:00Z)",
          },
          topic: { type: "string", description: "Reason for meeting" },
        },
        required: ["email", "name", "datetime"],
      },
    },
  },
];

// 3. Execution Implementation Map
export const functions: Record<string, Function> = {
  sendEmail: async (args: any) => {
    console.log("Tool Execution: Sending Email", args);
    const validArgs = sendEmailSchema.parse(args);
    return await sendEmail(validArgs);
  },
  bookMeeting: async (args: any) => {
    console.log("Tool Execution: Booking Meeting", args);
    const validArgs = bookMeetingSchema.parse(args);
    return await bookMeeting(validArgs);
  },
};
