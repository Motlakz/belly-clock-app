import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface StressQuestion {
    id: number;
    text: string;
    score?: number;
    feedback?: string;
}

export async function generateStressQuestions(): Promise<StressQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 5 unique and specific questions for a comprehensive stress assessment. Each question should focus on a different aspect of stress, such as work-related stress, personal relationships, physical symptoms, coping mechanisms, and lifestyle factors. Avoid generic questions and aim for depth and specificity. Return only a JSON array of objects, where each object has 'id' (number), 'text' (string), and 'score' (number, initially 0). Example format:
    [
        {"id": 1, "text": "How often do you experience tension headaches or muscle pain due to stress?", "score": 0},
        ...
    ]`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Attempt to extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("No JSON array found in the response");
        }

        const jsonString = jsonMatch[0];
        const questions = JSON.parse(jsonString);

        // Validate the structure of the parsed JSON
        if (!Array.isArray(questions) || questions.length !== 5 || 
            !questions.every(q => 
                typeof q.id === 'number' && 
                typeof q.text === 'string' && 
                typeof q.score === 'number'
            )) {
            throw new Error("Invalid question format in the response");
        }

        return questions;
    } catch (error) {
        console.error("Error generating stress questions:", error);
        throw error;
    }
}

export async function getStressManagementSuggestions(stressScores: number[]): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const averageScore = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
    
    const prompt = `Based on an average stress score of ${averageScore.toFixed(2)} (on a scale from 0 to 5, where 5 is highest stress), provide 4 unique and specific personalized stress management suggestions. Each suggestion should be actionable, detailed, and tailored to the stress level. Include a mix of immediate relief techniques and long-term stress management strategies. Consider aspects like lifestyle changes, mindfulness practices, physical activities, and cognitive techniques. Return only a JSON array of strings, without any additional formatting or markdown. Example format:
    [
        "Practice the 4-7-8 breathing technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat this cycle 4 times, twice a day to activate your parasympathetic nervous system and reduce acute stress.",
        ...
    ]`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Attempt to extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error("No JSON array found in the response");
        }

        const jsonString = jsonMatch[0];
        const suggestions = JSON.parse(jsonString);

        if (!Array.isArray(suggestions) || suggestions.length !== 4) {
            throw new Error("Invalid suggestions format in the response");
        }

        return suggestions;
    } catch (error) {
        console.error("Error generating stress management suggestions:", error);
        throw error;
    }
}
