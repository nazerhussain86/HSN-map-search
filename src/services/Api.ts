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

export const getDutyDetails = async (payload: HSNPayload) => {
  const response = await api.post("/hsn/calculate-duty", payload);
  return response.data;
};

export default api;
