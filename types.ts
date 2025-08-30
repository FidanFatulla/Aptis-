export enum TestType {
  GRAMMAR_VOCABULARY = 'Grammar & Vocabulary',
  READING = 'Reading',
  WRITING = 'Writing',
  SPEAKING = 'Speaking',
  LISTENING = 'Listening',
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingTask {
    type: 'sentence-completion' | 'text-cohesion' | 'short-comprehension' | 'long-comprehension';
    title: string;
    instructions: string;
    passage?: string;
    questions: {
        questionText: string;
        options: string[];
        correctAnswer: string;
    }[];
}

export interface WritingTask {
    id: number;
    instructions: string;
    wordLimit?: number;
}

export interface SpeakingTask {
    id: number;
    instructions: string;
    preparationTime: number; // in seconds
    recordingTime: number; // in seconds
    imageUrl?: string;
}

export interface ListeningTask {
    title: string;
    instructions: string;
    transcript: string; // The text to be converted to speech
    questions: MCQ[];
}
