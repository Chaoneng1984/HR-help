import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini client
// Note: In a real environment, ensure process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Uses Gemini to parse messy text and extract a list of names.
 */
export const extractNamesFromText = async (text: string): Promise<string[]> => {
  if (!text || !text.trim()) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Extract a list of person names from the following text. Ignore generic words, headers, or dates. Return only the names as a JSON array of strings. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini extractNames error:", error);
    return [];
  }
};

/**
 * Uses Gemini to generate creative team names for groups based on a theme.
 */
export const generateCreativeTeamNames = async (numberOfGroups: number, theme: string): Promise<string[]> => {
  try {
    const prompt = `Generate ${numberOfGroups} creative, fun, and distinct team names based on the theme: "${theme}". 
    The names should be suitable for a corporate team building activity. 
    Return strictly a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return Array.from({ length: numberOfGroups }, (_, i) => `Group ${i + 1}`);

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini generateTeamNames error:", error);
    // Fallback names
    return Array.from({ length: numberOfGroups }, (_, i) => `Group ${i + 1}`);
  }
};
