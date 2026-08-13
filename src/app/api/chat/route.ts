import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google("gemini-3.6-flash"), 
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}