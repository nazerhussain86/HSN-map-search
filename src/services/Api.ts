import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44320/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    console.log("AXIOS REQUEST:", {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      data: config.data,
    });
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log("AXIOS RESPONSE:", {
      url: `${response.config.baseURL}${response.config.url}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("AXIOS ERROR:", {
      url: error.config
        ? `${error.config.baseURL}${error.config.url}`
        : "",
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

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

// export const suggestHSNCode = async (description: string) => {
//   const response = await api.post("/hsn/suggest", { description });
//   return response.data;
// };

import { HSN_DATA } from '../data';

export const suggestHSNCode = async (description: string) => {
  if (!description.trim()) return [];

  const keywords = description
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const results = HSN_DATA.filter(item => {
    const desc = item.description?.toLowerCase() || '';

    // match if ALL keywords exist
    return keywords.every(word => desc.includes(word));
  });

  return results;
};

// export const getDutyDetails = async (payload: HSNPayload) => {
//   const response = await api.post("/hsn/calculate-duty", payload);
//   return response.data;
// };
export interface HSNData {
   assessableValue: number;
   basicDuty: number;
   sws: number;
   igst: number;
   totalDuty: number;
   landedCost: number;
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

export default api;
