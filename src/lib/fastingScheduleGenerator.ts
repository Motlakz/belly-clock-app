import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FastingType {
    name: string;
    duration: number;
    icon: string;
}

export interface FastingScheduleParams {
  fastingType: FastingType;
}

export async function generateFastingSchedule(params: FastingScheduleParams): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const isIntermittent = params.fastingType.name.includes('Intermittent') || params.fastingType.name === 'OMAD';

  let prompt = `Generate an optimized fasting schedule for ${params.fastingType.name}.`;

  if (isIntermittent) {
    prompt += `
      Current time: ${new Date().toLocaleTimeString()}
      Fasting duration: ${params.fastingType.duration / 3600} hours
      
      Consider the following factors:
      1. Circadian rhythm
      2. Meal timing
      3. Sleep schedule
      4. Daily routine
    `;
  } else {
    prompt += `
      Consider the following factors:
      1. Prayer times
      2. Suhoor and Iftar timings (if applicable)
      3. Energy levels throughout the day
      4. Spiritual practices associated with ${params.fastingType.name}
      5. Fasting duration: ${params.fastingType.duration / 3600} hours
    `;
  }

  prompt += `
    Provide a schedule with specific timings, and include brief explanations for why these times are optimal.
    Also, include any specific guidelines or practices associated with ${params.fastingType.name}.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating optimized schedule:', error);
    throw new Error('Failed to generate optimized schedule. Please try again later.');
  }
}
