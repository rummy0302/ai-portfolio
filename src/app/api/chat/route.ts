// Save this file as: src/app/api/chat/route.ts
import { NextRequest } from "next/server";
import { retrieveContext } from "@/lib/rag";
import { streamChat } from "@/lib/gemini";
import { PERSONA } from "@/config/persona";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response("Missing message", { status: 400 });
    }

    // 1. Retrieve relevant context from Supabase RAG
    const context = await retrieveContext(message);

    // 2. Stream response from Gemini
    const stream = streamChat(PERSONA.systemPrompt, message, context);

    // 3. Return as readable stream so the frontend can show text as it arrives
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}