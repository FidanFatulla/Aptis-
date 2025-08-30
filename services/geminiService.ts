import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, ReadingTask, SpeakingTask, WritingTask, ListeningTask } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const mcqSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "The main question text, which might be a sentence with a blank."
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 string options."
            },
            correctAnswer: {
                type: Type.STRING,
                description: "The correct option string from the options array."
            }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

const generateMCQs = async <T,>(prompt: string): Promise<T[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: mcqSchema,
                temperature: 0.8,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as T[];
    } catch (error) {
        console.error("Error generating MCQs:", error);
        throw new Error("Failed to generate test content. Please try again later.");
    }
};

export const generateGrammarAndVocabularyTest = async (): Promise<MCQ[]> => {
    const prompt = `Generate 25 mixed grammar and vocabulary multiple-choice questions suitable for a B1/B2 level General Aptis test. The questions should cover a range of topics including verb tenses, prepositions, phrasal verbs, and common vocabulary. For vocabulary, use sentence completion tasks. Provide the response as a valid JSON array of objects.`;
    return generateMCQs<MCQ>(prompt);
};

export const generateReadingTest = async (): Promise<ReadingTask[]> => {
    // For simplicity, we will generate one long-comprehension task
    const prompt = `Generate a B2-level reading comprehension task for an Aptis test. The passage should be around 350 words about a topic like technology, environment, or social trends. After the passage, create 5 multiple-choice questions to test understanding of the main ideas, details, and inference. Provide the response as a single JSON object.`;

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

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: readingSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return [data] as ReadingTask[]; // Return as an array with one task
    } catch (error) {
        console.error("Error generating Reading Test:", error);
        throw new Error("Failed to generate reading test content.");
    }
};

export const generateWritingTest = async (): Promise<WritingTask[]> => {
    // We'll generate 3 tasks for this version.
    return Promise.resolve([
        { id: 1, instructions: "You are joining a new sports club. Fill in the form. You have 3 minutes.\n\n- Full Name:\n- Sport of interest:\n- Previous experience (one sentence):" },
        { id: 2, instructions: "You are a member of a travel club. You are talking to three other members in the travel club chat room. Answer their questions. You have 10 minutes.\n\nAlex: Hi! Welcome to the club. What's the most interesting place you've ever visited?\n\nSam: I'm planning a trip to Italy. Any recommendations on what to see?\n\nJo: What kind of holidays do you enjoy the most? (e.g., beach, city break, adventure)" },
        { id: 3, instructions: "You recently bought an item online that arrived damaged. Write an email to the company's customer service. Explain the problem and tell them what you want them to do. Write about 120-150 words. You have 20 minutes." },
    ]);
};

export const generateSpeakingTest = async (): Promise<SpeakingTask[]> => {
    // AI generation for image URLs is not feasible here, so we use placeholders.
    // Prompts are static for reliability in this demo.
    return Promise.resolve([
        { id: 1, instructions: "Tell me about your hobbies and interests. You have 45 seconds to speak.", preparationTime: 15, recordingTime: 45 },
        { id: 2, instructions: "Describe this picture in as much detail as you can. What is happening? What are the people doing? You have 45 seconds.", preparationTime: 30, recordingTime: 45, imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400` },
        { id: 3, instructions: "Now, I will ask you two questions about the picture. First, what do you think the people will do next? Second, describe a time you participated in a similar activity.", preparationTime: 30, recordingTime: 60 },
    ]);
};

export const generateListeningTest = async (): Promise<ListeningTask[]> => {
    const prompt = `Generate a B1/B2 level listening test task for an Aptis exam. Provide a transcript of a short conversation or monologue (around 100-150 words) between two speakers about a daily topic like making plans, a past holiday, or a work situation. Then, create 4 multiple-choice questions based on the transcript to test for specific information and main ideas. The question text should be stored in the 'question' property. Return a single JSON object.`;

    const listeningSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A suitable title for the listening task, e.g., 'A Conversation About Weekend Plans'." },
            instructions: { type: Type.STRING, description: "Instructions for the user, e.g., 'Listen to the conversation and answer the questions.'" },
            transcript: { type: Type.STRING, description: "The full transcript of the audio." },
            questions: mcqSchema, // Reusing the mcqSchema
        },
        required: ["title", "instructions", "transcript", "questions"]
    };
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: listeningSchema,
            },
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return [data] as ListeningTask[]; // Return as an array with one task
    } catch (error) {
        console.error("Error generating Listening Test:", error);
        throw new Error("Failed to generate listening test content.");
    }
};
