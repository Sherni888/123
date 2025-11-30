import { GoogleGenAI } from "@google/genai";

// Safe access to API Key to prevent "process is not defined" crash in browser runtime
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    // In some browser environments (like GH Pages without proper build vars), process might be undefined.
    // Return empty string to allow app to load, even if AI features won't work.
    return '';
  }
};

const API_KEY = getApiKey();

export const generateProductDescription = async (productName: string, categoryName: string, keywords: string): Promise<string> => {
  if (!API_KEY) {
    console.warn("No API Key found for Gemini");
    return "AI generation unavailable: Missing API Key.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      Write a compelling, marketing-focused product description for a digital store.
      Product Name: ${productName}
      Category: ${categoryName}
      Keywords/Features: ${keywords}
      
      Keep it under 300 characters. Make it sound professional and exciting for a gamer or tech enthusiast.
      Do not use markdown formatting. Just plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating description. Please try again.";
  }
};