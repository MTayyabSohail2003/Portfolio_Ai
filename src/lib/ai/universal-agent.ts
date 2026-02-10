import { openai, AI_MODELS } from "./provider";
import { publicTools, handlePublicTools } from "./tools/public";
import { adminTools, handleAdminTools } from "./tools/admin";
import { superAdminTools, handleSuperAdminTools } from "./tools/super-admin";

type UserRole = "public" | "admin" | "super-admin";

export async function runUniversalAgent(
  history: any[],
  newMessage: string,
  userId: string,
  role: UserRole
) {
  try {
    // 1. DYNAMIC TOOL ASSEMBLY
    let tools = [...publicTools];
    if (role === "admin" || role === "super-admin") {
      tools = [...tools, ...adminTools];
    }
    if (role === "super-admin") {
      tools = [...tools, ...superAdminTools];
    }

    // 2. DYNAMIC SYSTEM PROMPT
    let systemPrompt = `You are Muhammad Tayyab's AI Digital Twin.
    - For public users: Answer questions about Muhammad Tayyab's portfolio, skills, and experience. Be professional and friendly.
    - If asked about contact, provide the info directly.
    `;

    if (role === "admin") {
      systemPrompt += `\n[ADMIN MODE ACTIVE]: You are now a Co-Pilot for the Admin. You have access to content management tools (Projects, Blogs, Tasks).`;
    }
    if (role === "super-admin") {
      systemPrompt += `\n[SUPER ADMIN / CFO MODE ACTIVE]: You have FULL ACCESS including Financial Data and User Management. Tread carefully.`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: newMessage },
    ];

    // 3. FIRST PASS: DECIDE
    let runner;
    let retryCount = 0;
    const maxRetries = 3;
    let delay = 1000;

    while (retryCount <= maxRetries) {
      try {
        runner = await openai.chat.completions.create({
          model: AI_MODELS.chat,
          messages: messages as any,
          tools: tools as any,
          tool_choice: "auto",
        });
        break;
      } catch (error: any) {
        if (error.status === 429 && retryCount < maxRetries) {
          console.warn(
            `Universal Agent Rate Limit (Pass 1). Retrying in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
          retryCount++;
        } else {
          console.error("Universal Agent Error (Pass 1):", error);
          throw error;
        }
      }
    }

    if (!runner) throw new Error("Failed to get response after retries");

    const msg = runner.choices[0].message;

    // 4. EXECUTION LOOP
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg as any);

      for (const toolCall of msg.tool_calls) {
        let result = "Tool failed or unauthorized.";

        if (toolCall.type === "function") {
          const fnName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);

          console.log(`[UniversalAgent] Executing ${fnName} for ${role}`);

          // Try Public
          const publicRes = await handlePublicTools(fnName, args);
          if (publicRes !== null) {
            result = publicRes;
          }
          // Try Admin (Guard)
          else if (role === "admin" || role === "super-admin") {
            const adminRes = await handleAdminTools(fnName, args);
            if (adminRes !== null) result = adminRes;
          }
          // Try Super Admin (Guard)
          if (
            role === "super-admin" &&
            result === "Tool failed or unauthorized."
          ) {
            const superRes = await handleSuperAdminTools(fnName, args, userId);
            if (superRes !== null) result = superRes;
          }
        }

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      // 5. FINAL PASS
      const final = await openai.chat.completions.create({
        model: AI_MODELS.chat,
        messages: messages as any,
      });

      return final.choices[0].message.content;
    }

    return msg.content;
  } catch (error) {
    console.error("Universal Agent Error:", error);
    return "I'm having trouble connecting to my brain right now.";
  }
}
