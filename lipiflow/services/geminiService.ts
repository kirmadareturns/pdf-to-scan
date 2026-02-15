import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transliterateHindiToHinglish = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Transliterate the following Hindi text (Devanagari script) into Hinglish (Roman Latin script). 
      
      Rules:
      1. Strictly preserve the original Hindi words. DO NOT translate the meaning into English.
      2. Use natural spelling that is common in informal chats (e.g., "नमस्ते" -> "Namaste", "क्या हाल है" -> "Kya haal hai").
      3. Maintain the punctuation and tone of the original text.
      4. Return ONLY the transliterated text, no introductory or concluding remarks.

      Input:
      ${text}`,
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Transliteration error:", error);
    throw new Error("Failed to transliterate text. Please try again.");
  }
};