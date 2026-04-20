import { NextResponse } from "next/server";
import OpenAI from "openai";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Audio file not provided" }, { status: 400 });
    }

    if (!env.openAiApiKey) {
      return NextResponse.json({ error: "OpenAI API Key is missing. Speech to text is disabled." }, { status: 503 });
    }

    const client = new OpenAI({ apiKey: env.openAiApiKey });

    // Node.js native File object can be generated from the Blob if necessary.
    // OpenAI Node SDK accepts Web API File object for browser environments,
    // but in Node it accepts standard Form Data fields perfectly natively in Next.js 15.
    
    // Using a trick to convert the generic Blob into a File with a filename since OpenAI requires it.
    const audioFile = new File([file], "recording.webm", { type: file.type || "audio/webm" });

    const response = await client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en", // Or let it auto-detect which is amazing for Hinglish
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    logger.error("Whisper transcription failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
  }
}
