
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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

export const buildHSNFullPrompt = (hsnCode: string, description: string) => `
You are an expert Indian Customs Tariff & Import Duty engine.

You MUST behave like an Indian Customs Notification lookup system.

Input:
HSN Code: ${hsnCode}
Product Description: ${description}

Generate complete import-related details strictly as per Indian Customs practice.

⚠️ CRITICAL RULES (MANDATORY):
- Output ONLY valid JSON
- No markdown, no explanations
- Arrays must NEVER be empty
- Percentages must be numbers
- Monetary values must be numbers (₹)
- If exact data is unavailable, return the MOST COMMONLY APPLIED Indian Customs notification
- NEVER return null or empty for notifications
- Every duty MUST contain at least ONE notification

Allowed Notification Sources:
- Customs Tariff Act, 1975 (First Schedule – General Rate)
- Notification No. 12/2017-Customs
- Notification No. 50/2017-Customs
- Notification No. 57/2017-Customs
- Any other commonly applied Indian Customs notification relevant to the HSN

----------------------------------
RETURN JSON IN THIS EXACT STRUCTURE
----------------------------------

{
  "hsnBasicInfo": {
    "hsnCode": "string",
    "description": "string",
    "uqc": "string",
    "policy": "Free | Restricted | Prohibited",
    "chapter": {
      "code": "string",
      "title": "string"
    },
    "heading": {
      "code": "string",
      "title": "string"
    },
    "subheading": {
      "code": "string",
      "title": "string"
    }
  },

  "dutyDetails": [
    {
      "no": number,
      "valueAndDutyDescription": "string",
      "scheduledDutyPercent": number,
      "notifications": [
        {
          "notificationNumber": "string",
          "description": "string",
          "effectiveDutyPercent": number
        }
      ],
      "effectiveDutyPercent": number,
      "calculatedAmount": number
    }
  ],

  "declarations": [
    {
      "statement": "string",
      "description": "string"
    }
  ],

  "requiredDocuments": [
    {
      "docCode": "string",
      "description": "string"
    }
  ],

  "ftaDetails": [
    {
      "no": number,
      "ftaNotification": "string",
      "ftaDutyPercent": number,
      "applicableCountries": number
    }
  ]
}
`;

export const getHSNDetailsFromAI = async (
  hsnCode: string,
  description: string
) => {
  const prompt = buildHSNFullPrompt(hsnCode, description);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || "{}");
};

