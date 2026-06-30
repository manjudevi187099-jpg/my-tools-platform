import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { text, count } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate ${count} multiple choice questions from the following text. 
    Return the response as a JSON array where each item has: "question", "options" (array of 4), and "correctAnswer".
    Text: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const mcqs = JSON.parse(response.text());

    return NextResponse.json(mcqs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate MCQs" }, { status: 500 });
  }
}