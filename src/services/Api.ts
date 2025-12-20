import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 120000, // ✅ 2 minutes
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔹 Request logger
api.interceptors.request.use(
  (config) => {
    console.log("📤 AXIOS REQUEST", {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response logger
api.interceptors.response.use(
  (response) => {
    console.log("📥 AXIOS RESPONSE", {
      url: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ AXIOS ERROR", {
      url: error.config
        ? `${error.config.baseURL}${error.config.url}`
        : "NO_URL",
      status: error.response?.status ?? "NO_RESPONSE",
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const suggestHSNCode = async (description: string) => {
  const { data } = await api.post("/hsn/suggest", { description });
  return data;
};

export const getHSNDetailsFromAI = async (
  hsnCode: string,
  description: string
) => {
  const { data } = await api.post("/hsn/getDutyDetails", {
    hsnCode,
    description,
  });
  return data;
};

export const loginUser = async (
  username: string,
  password: string
) => {
  const { data } = await api.post("/hsn/login", {
    username,
    password
  });
  return data;
};

export interface HSNData {
   assessableValue: number;
   basicDuty: number;
   sws: number;
   igst: number;
   totalDuty: number;
   landedCost: number;
}
export interface HSNPayload {
  description: string;
  hsnCode: string;
  qty: number;
  unitPrice: number;
  amount: number;
  freight: number;
  insurance: number;
  misc: number;
  assessableValue: number;
}
export const getDutyDetails = async (payload: HSNPayload): Promise<HSNData> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    
    // Logic for calculation
    // In a real application, this would query a database for specific duty rates by HSN code.
    // For this dynamic demo, we use standard rates.
    const cif = payload.amount + payload.freight + payload.insurance + payload.misc;
    
    const basicRate = 0.10;
    const swsRate = 0.10; // 10% of basic
    const igstRate = 0.18;
    
    const basicDuty = cif * basicRate;
    const sws = basicDuty * swsRate;
    const igst = (cif + basicDuty + sws) * igstRate;
    const totalDuty = basicDuty + sws + igst;
    
    return {
        assessableValue: cif,
        basicDuty,
        sws,
        igst,
        totalDuty,
        landedCost: cif + totalDuty
    };
};

// export const getGeminiResponse = async (prompt: string, imageBase64?: string, mimeType: string = 'image/jpeg'): Promise<string> => {
//   try {
//     let contentParts: any[] = [{ text: prompt }];

//     if (imageBase64) {
//       // Ensure the base64 string doesn't contain the data URL prefix
//       const base64Data = imageBase64.split(',')[1] || imageBase64;

//       contentParts.push({
//         inlineData: {
//           mimeType: mimeType,
//           data: base64Data,
//         },
//       });
//     }

//     // const response = await ai.models.generateContent({
//     //   model: 'gemini-2.5-flash',
//     //   contents: { parts: contentParts },
//     //   config: {
//     //     temperature: 0.3,
//     //   }
//     // });

//     return "I'm sorry, I couldn't generate a response.";
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw new Error("Failed to fetch response from AI Assistant.");
//   }
// };

export const getGeminiResponse = async (
  prompt: string,
  imageBase64?: string
) => {
  const { data } = await api.post("hsn/gemini", {
    prompt,
    imageBase64
  });

  return data.data;
};


export default api;
