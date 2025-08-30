
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This code runs on the server, so it can safely access environment variables.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set on the server.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Schemas for AI responses ---
const mcqSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "The main question text." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 string options." },
            correctAnswer: { type: Type.STRING, description: "The correct option string." }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

const readingSchema = {
    type: Type.OBJECT,
    properties: {
         type: { type: Type.STRING, description: "Should be 'long-comprehension'."},
         title: { type: Type.STRING, description: "A suitable title for the passage."},
         instructions: { type: Type.STRING, description: "Instructions for the user."},
         passage: { type: Type.STRING, description: "The full reading passage."},
         questions: {
             type: Type.ARRAY,
             items: {
                 type: Type.OBJECT,
                 properties: {
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING }
                 },
                 required: ["questionText", "options", "correctAnswer"]
             }
         }
    },
    required: ["type", "title", "instructions", "passage", "questions"]
};

const listeningSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A suitable title for the listening task." },
        instructions: { type: Type.STRING, description: "Instructions for the user." },
        transcript: { type: Type.STRING, description: "The full transcript of the audio." },
        questions: mcqSchema,
    },
    required: ["title", "instructions", "transcript", "questions"]
};

// --- Helper for calling the AI model ---
const generateContentFromModel = async (prompt: string, schema: object) => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.8,
        },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

// --- Main Serverless Function Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const { testType } = req.body;

    if (!testType || typeof testType !== 'string') {
        return res.status(400).json({ error: 'testType is required and must be a string.' });
    }

    try {
        let data;
        switch (testType) {
            case 'Grammar & Vocabulary':
                const gvPrompt = `Generate 25 mixed grammar and vocabulary multiple-choice questions suitable for a B1/B2 level General Aptis test. The questions should cover a range of topics including verb tenses, prepositions, phrasal verbs, and common vocabulary. For vocabulary, use sentence completion tasks. Provide the response as a valid JSON array of objects.`;
                data = await generateContentFromModel(gvPrompt, mcqSchema);
                break;
            
            case 'Reading':
                const readingPrompt = `Generate a B2-level reading comprehension task for an Aptis test. The passage should be around 350 words about a topic like technology, environment, or social trends. After the passage, create 5 multiple-choice questions to test understanding of the main ideas, details, and inference. Provide the response as a single JSON object.`;
                data = await generateContentFromModel(readingPrompt, readingSchema);
                break;

            case 'Listening':
                const listeningPrompt = `Generate a B1/B2 level listening test task for an Aptis exam. Provide a transcript of a short conversation or monologue (around 100-150 words) between two speakers about a daily topic like making plans, a past holiday, or a work situation. Then, create 4 multiple-choice questions based on the transcript to test for specific information and main ideas. The question text should be stored in the 'question' property. Return a single JSON object.`;
                data = await generateContentFromModel(listeningPrompt, listeningSchema);
                break;

            default:
                return res.status(400).json({ error: `Unknown or unsupported test type: ${testType}` });
        }
        return res.status(200).json(data);

    } catch (error) {
        console.error(`Error generating test for type ${testType}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return res.status(500).json({ error: "Failed to generate test content.", details: errorMessage });
    }
}