import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert consultant on the Harmonized System of Nomenclature (HSN) Codes for the Government of India. 
        Your goal is to assist users in finding the correct HS Code for their products and identifying the responsible Ministry or Department.
        
        Use the following context:
        - The user is navigating the "Guidebook on Mapping of HSN Codes".
        - Your answers should be precise, professional, and helpful for trade and policy purposes.
        - If asked about specific codes, try to infer from general knowledge of the Indian ITC(HS) system if specific data isn't provided in the prompt context, but strictly mention if you are estimating.
        - Focus on the "Make in India" and "Export Promotion" aspects if relevant.
        - Keep responses concise and formatted with Markdown.
        `,
        temperature: 0.3,
      }
    });
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch response from AI Assistant.");
  }
};
