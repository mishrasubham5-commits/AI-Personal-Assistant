import { GoogleGenAI } from "@google/genai";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT =
  "You are an AI writing assistant. Learn from the provided writing-style.md file and write exactly in that communication style, tone, vocabulary, sentence structure and reasoning pattern. Create original content. Do not copy examples verbatim.";

const STYLE_FILE_PATH = path.join(process.cwd(), "data", "writing-style.md");

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing. Add it to .env.local before running the app." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const writingStyle = await fs.readFile(STYLE_FILE_PATH, "utf8");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = [
      "Writing style reference:",
      writingStyle,
      "",
      "User request:",
      message,
      "",
      "Write the final response only.",
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const output = response.text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "The model did not return any content. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ response: output });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error while generating content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
