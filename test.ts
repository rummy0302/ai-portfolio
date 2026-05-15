// import "dotenv/config";
// import { embedText, streamChat } from "./src/lib/gemini";

// async function test() {
//   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
//   console.log(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
//   console.log(process.env.SUPABASE_SERVICE_KEY);
//   console.log("Testing embeddings...");

//   const vec = await embedText("Hello world");
//   console.log("Vector size:", vec.length);

//   console.log("\nTesting chat...\n");

//   for await (const token of streamChat(
//     "You are a helpful assistant",
//     "Explain AI in one sentence",
//     ""
//   )) {
//     process.stdout.write(token);
//   }

//   console.log("\nDone");
// }

// test();


import "./env"; // MUST be first line

import { embedText, streamChat } from "./src/lib/gemini";

async function test() {
  console.log("SUPABASE:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("GEMINI:", process.env.GEMINI_API_KEY);
  console.log("API KEY LOADED:", !!process.env.GEMINI_API_KEY);
  console.log("Testing embeddings...");

  const vec = await embedText("Hello world");
  console.log("Vector size:", vec.length);

  console.log("\nTesting chat...\n");

  for await (const token of streamChat(
    "You are a helpful assistant",
    "Explain AI in one sentence",
    ""
  )) {
    process.stdout.write(token);
  }

  console.log("\nDone");
}

test();