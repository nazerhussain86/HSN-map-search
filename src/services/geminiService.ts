
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: '' });

export const getGeminiResponse = async (prompt: string, imageBase64?: string, mimeType: string = 'image/jpeg'): Promise<string> => {
  try {
    let contentParts: any[] = [{ text: prompt }];

    if (imageBase64) {
      // Ensure the base64 string doesn't contain the data URL prefix
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      
      contentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contentParts },
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch response from AI Assistant.");
  }
};
