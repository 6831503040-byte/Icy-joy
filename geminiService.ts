
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getIceCreamMatch = async (mood: string, availableFlavors: string[]) => {
  try {
    const flavorList = availableFlavors.join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user says they are feeling: "${mood}". 
      
      Based ONLY on the following list of available flavors: [${flavorList}], recommend the best matching ice cream flavor. 
      
      Instructions:
      1. You MUST pick exactly one flavor from the list provided above.
      2. Provide a funny and sweet reason why this flavor matches their mood.
      3. Do NOT suggest any flavor that is not in the provided list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flavorName: { 
              type: Type.STRING,
              description: "The name of the flavor exactly as it appears in the provided list."
            },
            reason: { type: Type.STRING },
            vibe: { type: Type.STRING }
          },
          required: ["flavorName", "reason", "vibe"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      flavorName: availableFlavors[0] || "Vanilla Dream",
      reason: "Vanilla is a classic that never fails to comfort a busy mind!",
      vibe: "Cozy & Calm"
    };
  }
};
