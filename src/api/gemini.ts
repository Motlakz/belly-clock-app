import { GoogleGenerativeAI } from "@google/generative-ai";
import { FastingType } from '../lib/fastingMethods';
import { FastingHistory, UserProfile } from "../lib/fastingSuggestions";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getGeminiSuggestions(profile: UserProfile, history: FastingHistory, currentFastingType: FastingType): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Given the following user profile and fasting history, provide 3-5 personalized fasting suggestions:

User Profile:
${JSON.stringify(profile, null, 2)}

Fasting History:
${JSON.stringify(history, null, 2)}

Current Fasting Type:
${JSON.stringify(currentFastingType, null, 2)}

Please provide your response as a simple array of strings, without any additional formatting or markdown.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    // Remove any markdown formatting
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    console.log("Raw response:", text);
    
    // Fallback: try to extract suggestions manually
    const suggestions = text.match(/\\"(.+?)\\"/g);
    if (suggestions) {
      return suggestions.map(s => s.replace(/\\"/g, ''));
    }
    
    return [];
  }
}
