import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ── Embeddings ──────────────────────────────────────────────────
// outputDimensionality: 768 stays under Supabase ivfflat 2000-dim limit
export async function embedText(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 },
  });
  const vector = result.embeddings?.[0]?.values;
  if (!vector) throw new Error("Embedding failed: no vector returned");
  return vector;
}

// ── Chat stream ─────────────────────────────────────────────────
export async function* streamChat(
  systemPrompt: string,
  userMessage: string,
  context: string
): AsyncGenerator<string> {
  const prompt = context
    ? `System: ${systemPrompt}\n\nContext:\n${context}\n\nUser: ${userMessage}`
    : `System: ${systemPrompt}\n\nUser: ${userMessage}`;

  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  for await (const chunk of stream) {
    const text = chunk.text;
    if (text) yield text;
  }
}