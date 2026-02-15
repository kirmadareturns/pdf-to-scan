import { transliterate as transliterateText } from 'transliteration';

export const transliterateHindiToHinglish = (text: string): string => {
  if (!text.trim()) return "";

  try {
    const result = transliterateText(text, 'hi');
    return result;
  } catch (error) {
    console.error("Transliteration error:", error);
    throw new Error("Failed to transliterate text. Please try again.");
  }
};
