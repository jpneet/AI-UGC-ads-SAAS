import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

// Debug check (server startup time)
console.log("AI KEY LOADED:", !!apiKey);
console.log("AI KEY PREVIEW:", apiKey?.slice(0, 8));

if (!apiKey) {
  throw new Error("Missing Google GenAI API key");
}

const ai = new GoogleGenAI({
  apiKey,
});

export default ai;