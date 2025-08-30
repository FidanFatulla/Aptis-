
import { MCQ, ReadingTask, WritingTask, SpeakingTask, ListeningTask } from '../types';

// Helper function to call our secure backend endpoint
const callApi = async <T,>(testType: string): Promise<T> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType }),
    });

    if (!response.ok) {
        const errorResult = await response.json().catch(() => ({ error: "An unknown network error occurred" }));
        console.error(`API Error for ${testType}:`, errorResult);
        throw new Error(errorResult.error || 'Failed to generate test content from the server.');
    }

    return response.json();
};

export const generateGrammarAndVocabularyTest = async (): Promise<MCQ[]> => {
    return callApi<MCQ[]>('Grammar & Vocabulary');
};

export const generateReadingTest = async (): Promise<ReadingTask[]> => {
    const task = await callApi<ReadingTask>('Reading');
    return [task]; // The component expects an array of tasks
};

export const generateListeningTest = async (): Promise<ListeningTask[]> => {
    const task = await callApi<ListeningTask>('Listening');
    return [task]; // The component expects an array of tasks
};

// These tests are static and do not require an API call. They can remain on the client.
export const generateWritingTest = async (): Promise<WritingTask[]> => {
    return Promise.resolve([
        { id: 1, instructions: "You are joining a new sports club. Fill in the form. You have 3 minutes.\n\n- Full Name:\n- Sport of interest:\n- Previous experience (one sentence):" },
        { id: 2, instructions: "You are a member of a travel club. You are talking to three other members in the travel club chat room. Answer their questions. You have 10 minutes.\n\nAlex: Hi! Welcome to the club. What's the most interesting place you've ever visited?\n\nSam: I'm planning a trip to Italy. Any recommendations on what to see?\n\nJo: What kind of holidays do you enjoy the most? (e.g., beach, city break, adventure)" },
        { id: 3, instructions: "You recently bought an item online that arrived damaged. Write an email to the company's customer service. Explain the problem and tell them what you want them to do. Write about 120-150 words. You have 20 minutes." },
    ]);
};

export const generateSpeakingTest = async (): Promise<SpeakingTask[]> => {
    return Promise.resolve([
        { id: 1, instructions: "Tell me about your hobbies and interests. You have 45 seconds to speak.", preparationTime: 15, recordingTime: 45 },
        { id: 2, instructions: "Describe this picture in as much detail as you can. What is happening? What are the people doing? You have 45 seconds.", preparationTime: 30, recordingTime: 45, imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400` },
        { id: 3, instructions: "Now, I will ask you two questions about the picture. First, what do you think the people will do next? Second, describe a time you participated in a similar activity.", preparationTime: 30, recordingTime: 60 },
    ]);
};