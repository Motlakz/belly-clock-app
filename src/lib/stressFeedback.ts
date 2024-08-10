import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface StressQuestion {
    id: number;
    text: string;
    score: number;
}

export async function generateStressQuestions(): Promise<StressQuestion[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate 5 unique questions for a stress assessment. Each question should gauge different aspects of stress. Return only a JSON array of objects, where each object has 'id' (number), 'text' (string), and 'score' (number, initially 0).`;

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
        // Fallback questions
        return [
            { id: 1, text: "How often do you feel overwhelmed?", score: 0 },
            { id: 2, text: "How would you rate your sleep quality?", score: 0 },
            { id: 3, text: "How often do you experience physical tension?", score: 0 },
            { id: 4, text: "How easily can you concentrate on tasks?", score: 0 },
            { id: 5, text: "How often do you feel irritable?", score: 0 },
        ];
    }
}

export async function getStressManagementSuggestions(stressScores: number[]): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const averageScore = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
    
    const prompt = `Based on an average stress score of ${averageScore.toFixed(2)} (on a scale from 0 to 10, where 10 is highest stress), provide 3-5 personalized stress management suggestions. Return only a JSON array of strings, without any additional formatting or markdown.`;

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

        if (!Array.isArray(suggestions) || suggestions.length < 3 || suggestions.length > 5) {
            throw new Error("Invalid suggestions format in the response");
        }

        return suggestions;
    } catch (error) {
        console.error("Error generating stress management suggestions:", error);
        // Fallback suggestions
        return [
            "Practice deep breathing exercises for 5 minutes each day",
            "Take short breaks every hour to stretch and relax",
            "Prioritize getting 7-9 hours of sleep each night",
            "Engage in regular physical activity to reduce stress",
            "Consider trying meditation or mindfulness techniques"
        ];
    }
}
