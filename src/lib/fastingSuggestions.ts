import { getGeminiSuggestions } from '../api/gemini';
import { FastingType } from './fastingMethods';

export interface UserProfile {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  healthConditions: string[];
}

export interface FastingHistory {
  completedFasts: number;
  averageFastDuration: number; // in hours
  longestFast: number; // in hours
  consistency: number; // 0-1, representing the ratio of completed fasts to attempted fasts
}

export async function generateFastingSuggestions(
  profile: UserProfile,
  history: FastingHistory,
  currentFastingType: FastingType
): Promise<string[]> {
  const basicSuggestions = generateBasicSuggestions(profile, history, currentFastingType);
  const geminiSuggestions = await getGeminiSuggestions(profile, history, currentFastingType);

  const prioritizedSuggestions = [
    ...geminiSuggestions,
    ...basicSuggestions.slice(0, 2),
    ...basicSuggestions.slice(2)
  ];

  return [...new Set(prioritizedSuggestions)];
}

function generateBasicSuggestions(
  profile: UserProfile,
  history: FastingHistory,
  currentFastingType: FastingType
): string[] {
  const suggestions: string[] = [];

  // Basic health check
  if (profile.age < 18 || profile.age > 70) {
    suggestions.push("Consult with a healthcare professional before starting or changing your fasting routine.");
  }

  // BMI calculation and suggestion
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  if (bmi < 18.5) {
    suggestions.push("Your BMI indicates you're underweight. Consider focusing on nutrient-dense meals during your eating windows.");
  } else if (bmi > 30) {
    suggestions.push("Your BMI indicates obesity. Fasting can be beneficial, but consult with a doctor for a comprehensive weight loss plan.");
  }

  // Activity level suggestions
  if (profile.activityLevel === 'very active' || profile.activityLevel === 'active') {
    suggestions.push("Given your high activity level, ensure you're consuming enough calories and nutrients during your eating windows.");
  }

  // Fasting history based suggestions
  if (history.completedFasts < 5) {
    suggestions.push("You're new to fasting. Start with shorter fasting windows and gradually increase as you become more comfortable.");
  } else if (history.consistency < 0.7) {
    suggestions.push("Your fasting consistency could be improved. Try setting reminders or finding an accountability partner.");
  }

  if (history.averageFastDuration < 16 && currentFastingType.name !== '16:8 Intermittent Fasting') {
    suggestions.push("Based on your history, you might benefit from trying the 16:8 Intermittent Fasting method.");
  } else if (history.averageFastDuration >= 16 && history.averageFastDuration < 24 && currentFastingType.name !== 'One Meal A Day (OMAD)') {
    suggestions.push("You've been consistently fasting for extended periods. You might be ready to try One Meal A Day (OMAD) fasting.");
  }

  // Health condition based suggestions
  if (profile.healthConditions.includes('diabetes')) {
    suggestions.push("If you have diabetes, it's crucial to monitor your blood sugar levels closely while fasting. Consult with your doctor regularly.");
  }

  if (profile.healthConditions.includes('hypertension')) {
    suggestions.push("For those with hypertension, remember to stay hydrated during fasting periods and monitor your blood pressure regularly.");
  }

  // Gender-specific suggestions
  if (profile.gender === 'female') {
    suggestions.push("Women may need to take a more flexible approach to fasting, especially around their menstrual cycle. Listen to your body and adjust as needed.");
  }

  return suggestions;
}
