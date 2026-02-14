import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use process.env.API_KEY directly for initialization as per SDK guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async chatWithPDF(pdfText: string, userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
    // Fix: Select appropriate model for reasoning tasks (civil engineering queries)
    const model = 'gemini-3-pro-preview';
    
    // Fix: Properly configure chat session with conversation history and system instruction
    const chat = this.ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: `You are a helpful PDF assistant for Built-Theory.com. 
        You have access to the following text extracted from a PDF document:
        ---
        ${pdfText}
        ---
        Answer the user's questions based on this document. If you don't know, say so.`,
      }
    });

    // Fix: Access response text using the .text property directly (not a method)
    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  }
}

export const geminiService = new GeminiService();
