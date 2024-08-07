import { GoogleGenerativeAI } from "@google/generative-ai";
import { FastingType } from '../lib/fastingMethods';
import { FastingHistory, UserProfile } from "../lib/fastingSuggestions";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Create a simple in-memory cache
const cache: { [key: string]: { suggestions: string[], timestamp: number } } = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getGeminiSuggestions(profile: UserProfile, history: FastingHistory, currentFastingType: FastingType): Promise<string[]> {
  const cacheKey = getCacheKey(profile, history, currentFastingType);
  
  // Check if we have a valid cached result
  const cachedResult = cache[cacheKey];
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.suggestions;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Given the following user profile and fasting history, provide 3-5 personalized fasting suggestions:

User Profile:
${JSON.stringify(profile, null, 2)}

Fasting History:
${JSON.stringify(history, null, 2)}

Current Fasting Type:
${JSON.stringify(currentFastingType, null, 2)}

Please provide your response as a simple array of strings, without any additional formatting or markdown.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Remove any markdown formatting
    const cleanedText = text.replace(/```json\n|\n```/g, '').trim();
    const suggestions = JSON.parse(cleanedText);

    // Cache the result
    cache[cacheKey] = { suggestions, timestamp: Date.now() };

    return suggestions;
  } catch (error) {
    console.error("Error with Gemini API or parsing response:", error);
    
    // Fallback suggestions
    const fallbackSuggestions = [
      "Stay hydrated during your fasting periods.",
      "Break your fast with easily digestible foods.",
      "Listen to your body and adjust your fasting schedule if needed.",
      "Ensure you're getting enough nutrients during your eating windows.",
      "Consider consulting with a healthcare professional about your fasting routine."
    ];

    // Cache the fallback suggestions
    cache[cacheKey] = { suggestions: fallbackSuggestions, timestamp: Date.now() };
    
    return fallbackSuggestions;
  }
}

function getCacheKey(profile: UserProfile, history: FastingHistory, currentFastingType: FastingType): string {
  // Create a unique key based on the input parameters
  return JSON.stringify({
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    healthConditions: profile.healthConditions,
    completedFasts: history.completedFasts,
    averageFastDuration: history.averageFastDuration,
    longestFast: history.longestFast,
    consistency: history.consistency,
    fastingTypeName: currentFastingType.name
  });
}
