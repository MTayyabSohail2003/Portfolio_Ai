import { openai, AI_MODELS } from "@/lib/ai/provider";
import { tools, functions } from "@/lib/ai/tools";
import { retrieveContext } from "@/lib/ai/retriever";
import { PROMPTS } from "@/lib/ai/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // 1. RAG Retrieve
    // Only context for the last message
    const context = await retrieveContext(lastMessage.content);

    // 2. Prepare System Message
    // We inject RAG context into the system prompt
    const systemMessage = {
      role: "system",
      content: `${PROMPTS.SYSTEM_IDENTITY}\n\n${PROMPTS.RAG_INSTRUCTION(
        context
      )}`,
    };

    // 3. Prepare Conversation History
    // Sliding window: last 10 messages + system
    // OpenAI client expects strict role types, we assume messages are compatible or we cast
    const history = [systemMessage, ...messages.slice(-10)];

    // 4. Agent Loop (Manual)
    let turns = 0;
    const maxTurns = 5;

    // We stream the final text to the client.
    // NOTE: This basic stream doesn't support the Vercel AI SDK 'useChat' tool invocation UI.
    // The user will see the final answer but not the "Calling tool..." UI unless we implement the complex protocol.
    // Given the request for "Optimization" and "Native", this is the leanest valid implementation.

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let currentMessages = [...history];

        try {
          while (turns < maxTurns) {
            turns++;

            let response;
            let retryCount = 0;
            const maxRetries = 3;
            let delay = 1000;

            while (retryCount <= maxRetries) {
              try {
                response = await openai.chat.completions.create({
                  model: AI_MODELS.chat,
                  messages: currentMessages as any,
                  tools: tools as any,
                  tool_choice: "auto",
                  stream: true,
                });
                break; // Success
              } catch (error: any) {
                if (error.status === 429 && retryCount < maxRetries) {
                  console.warn(`Rate limit hit. Retrying in ${delay}ms...`);
                  await new Promise((resolve) => setTimeout(resolve, delay));
                  delay *= 2;
                  retryCount++;
                } else {
                  throw error; // Propagate other errors or if max retries reached
                }
              }
            }

            let contentBuffer = "";
            let toolCallsMap: Record<string, any> = {};

            // @ts-ignore
            for await (const chunk of response) {
              const delta = chunk.choices[0]?.delta;

              // Stream content immediately
              if (delta?.content) {
                contentBuffer += delta.content;
                controller.enqueue(encoder.encode(delta.content));
              }

              // Accumulate tool calls
              if (delta?.tool_calls) {
                for (const tc of delta.tool_calls) {
                  if (!toolCallsMap[tc.index]) {
                    toolCallsMap[tc.index] = {
                      id: tc.id,
                      function: { name: "", arguments: "" },
                      type: "function",
                    };
                  }
                  if (tc.id) toolCallsMap[tc.index].id = tc.id;
                  if (tc.function?.name)
                    toolCallsMap[tc.index].function.name += tc.function.name;
                  if (tc.function?.arguments)
                    toolCallsMap[tc.index].function.arguments +=
                      tc.function.arguments;
                }
              }
            }

            const toolCalls = Object.values(toolCallsMap);

            // Append assistant message to history
            if (contentBuffer || toolCalls.length > 0) {
              currentMessages.push({
                role: "assistant",
                content: contentBuffer || null,
                tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
              } as any);
            }

            if (toolCalls.length === 0) {
              break; // Done
            }

            // Execute Tools
            for (const tc of toolCalls) {
              const fnName = tc.function.name;
              const argsStr = tc.function.arguments;
              let result = "Error: Tool execution failed";

              try {
                const args = JSON.parse(argsStr);
                if (functions[fnName]) {
                  const output = await functions[fnName](args);
                  result = JSON.stringify(output);
                } else {
                  result = "Error: Function not found";
                }
              } catch (e: any) {
                result = `Error parsing arguments: ${e.message}`;
              }

              currentMessages.push({
                role: "tool",
                tool_call_id: tc.id,
                content: result,
              } as any);
            }
          }
        } catch (err) {
          console.error("Stream Loop Error:", err);
          controller.enqueue(
            encoder.encode("\n[System Error: Agent failed to complete request]")
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Agent Error:", error);
    return new Response("Internal Agent Error", { status: 500 });
  }
}
