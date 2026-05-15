import { getServerSupabase } from "./supabase";
import { embedText } from "./gemini";

export interface KnowledgeChunk {
  id: string;
  category: string;
  content: string;
  similarity: number;
}

export async function retrieveContext(query: string, topK = 4): Promise<string> {
  const supabase = getServerSupabase();

  const queryEmbedding = await embedText(query);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: queryEmbedding,
    match_count: topK,
    match_threshold: 0.5,
  });

  if (error) {
    console.error("RAG retrieval error:", error);
    return "";
  }

  const chunks = data as KnowledgeChunk[];
  if (!chunks || chunks.length === 0) return "";

  return chunks
    .map((c) => `[${c.category.toUpperCase()}]\n${c.content}`)
    .join("\n\n");
}