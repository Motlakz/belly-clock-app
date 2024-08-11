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

export interface ProgressData {
  date: string;
  fastingHours: number;
}

export async function generateFastingSuggestions(
  profile: UserProfile,
  history: FastingHistory,
  currentFastingType: FastingType,
  progressData: ProgressData[]
): Promise<string[]> {
  const basicSuggestions = generateBasicSuggestions(profile, history, currentFastingType, progressData);
  const geminiSuggestions = await getGeminiSuggestions(profile, history, currentFastingType, progressData);

  const prioritizedSuggestions = [
    ...geminiSuggestions,
    ...basicSuggestions.slice(0, 2),
    ...basicSuggestions.slice(2)
  ];

  return [...new Set(prioritizedSuggestions)];
}

export function generateBasicSuggestions(
  profile: UserProfile,
  history: FastingHistory,
  currentFastingType: FastingType,
  progressData: ProgressData[]
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

  // New suggestions based on ProgressTracker metrics
  if (progressData.length > 0) {
    const averageFastingHours = progressData.reduce((sum, item) => sum + item.fastingHours, 0) / progressData.length;
    const longestFast = Math.max(...progressData.map(item => item.fastingHours));
    const totalFasts = progressData.length;

    // Suggestion based on average fasting hours
    if (averageFastingHours < 12) {
      suggestions.push("Your average fasting duration is less than 12 hours. Consider gradually increasing your fasting window to achieve better results.");
    } else if (averageFastingHours > 18) {
      suggestions.push("Great job maintaining longer fasts! Make sure you're getting enough nutrients during your eating windows.");
    }

    // Suggestion based on longest fast
    if (longestFast > 24) {
      suggestions.push("You've achieved an extended fast of over 24 hours. Consider incorporating occasional longer fasts if it aligns with your goals and health status.");
    }

    // Suggestion based on total fasts
    if (totalFasts < 7) {
      suggestions.push("You're just getting started with fasting. Keep it up and try to maintain consistency to see long-term benefits.");
    } else if (totalFasts > 30) {
      suggestions.push("You've been fasting consistently for a while. Consider reassessing your goals and potentially adjusting your fasting routine to keep challenging yourself.");
    }

    // Suggestion based on fasting trend
    const recentFasts = progressData.slice(-7);
    const recentAverage = recentFasts.reduce((sum, item) => sum + item.fastingHours, 0) / recentFasts.length;
    if (recentAverage > averageFastingHours) {
      suggestions.push("Your recent fasts have been longer than your overall average. Great progress! Keep up the good work.");
    } else if (recentAverage < averageFastingHours) {
      suggestions.push("Your recent fasts have been shorter than your overall average. Consider refocusing on your fasting goals or adjusting your schedule if needed.");
    }

    // Suggestion based on fasting consistency
    const consistencyThreshold = 0.8; // 80% consistency
    const consistentFasts = progressData.filter(item => item.fastingHours >= currentFastingType.duration).length;
    const consistency = consistentFasts / totalFasts;
    if (consistency < consistencyThreshold) {
      suggestions.push(`Your fasting consistency is ${(consistency * 100).toFixed(1)}%. Try to improve your consistency to at least 80% for better results.`);
    } else {
      suggestions.push(`Great job maintaining ${(consistency * 100).toFixed(1)}% consistency in your fasts! Consistency is key to seeing long-term benefits.`);
    }
  }

  return suggestions;
}
