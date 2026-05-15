// Save this file as: src/app/api/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase";
import { embedText } from "@/lib/gemini";
import { KNOWLEDGE_BASE } from "@/config/persona";

export const runtime = "nodejs";

// POST /api/seed?secret=YOUR_SEED_SECRET
// Run this once to embed and upload your knowledge base to Supabase.
// Protected by SEED_SECRET env variable so only you can trigger it.
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServerSupabase();
  const results = [];

  for (const entry of KNOWLEDGE_BASE) {
    try {
      // Generate 768-dim embedding via Gemini
      const embedding = await embedText(entry.content);

      // Insert into Supabase knowledge_base table
      const { error } = await supabase.from("knowledge_base").insert({
        category: entry.category,
        content: entry.content,
        embedding,
      });

      if (error) throw error;

      results.push({ category: entry.category, status: "ok" });

      // Small delay between requests to avoid Gemini rate limits
      await new Promise((r) => setTimeout(r, 250));
    } catch (err: any) {
      results.push({
        category: entry.category,
        status: "error",
        error: err.message,
      });
    }
  }

  return NextResponse.json({ seeded: results.length, results });
}