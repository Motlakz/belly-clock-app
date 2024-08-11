import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FastingType {
    name: string;
    duration: number;
    icon: string;
}

export interface WaterIntakeGuidanceParams {
    fastingType: FastingType;
    weight: number; // in kg
    activityLevel: 'sedentary' | 'moderate' | 'active';
    climate: 'temperate' | 'hot' | 'cold';
}

export async function generateWaterIntakeGuidance(params: WaterIntakeGuidanceParams): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const isIntermittent = params.fastingType.name.includes('Intermittent') || params.fastingType.name === 'OMAD';

    let prompt = `Generate optimized water intake guidance for ${params.fastingType.name} fasting.`;

    prompt += `
        User details:
        Weight: ${params.weight} kg
        Activity level: ${params.activityLevel}
        Climate: ${params.climate}
        Fasting duration: ${params.fastingType.duration / 3600} hours

        Consider the following factors:
        1. Hydration needs during fasting periods
        2. Electrolyte balance
        3. Timing of water intake
        4. Potential health benefits and risks
    `;

    if (isIntermittent) {
        prompt += `
            5. Water intake during eating windows
            6. Pre and post-workout hydration (if applicable)
        `;
    } else {
        prompt += `
            5. Hydration strategies for extended fasting periods
            6. Breaking the fast safely with regards to hydration
        `;
    }

    prompt += `
        Provide a detailed water intake guide with specific recommendations, including:
        1. Total daily water intake goal
        2. Timing of water consumption throughout the day
        3. Tips for staying hydrated during fasting periods
        4. Warning signs of dehydration to watch for
        5. Any specific hydration practices associated with ${params.fastingType.name}

        Please format the response in markdown for easy reading.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating water intake guidance:', error);
        throw new Error('Failed to generate water intake guidance. Please try again later.');
    }
}
