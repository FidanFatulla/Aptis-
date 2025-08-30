
import React, { useState, useEffect, useCallback } from 'react';
import { TestType, MCQ, ReadingTask, WritingTask, SpeakingTask, ListeningTask } from '../types';
import { generateGrammarAndVocabularyTest, generateReadingTest, generateWritingTest, generateSpeakingTest, generateListeningTest } from '../services/geminiService';
import GrammarVocabularyTest from './tests/GrammarVocabularyTest';
import ReadingTest from './tests/ReadingTest';
import WritingTest from './tests/WritingTest';
import SpeakingTest from './tests/SpeakingTest';
import ListeningTest from './tests/ListeningTest';

interface TestContainerProps {
  testType: TestType;
  onComplete: (results: { score: number, total: number, testType: TestType }) => void;
  onBack: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">Generating your test...</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Please wait a moment.</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-lg font-semibold text-red-700 dark:text-red-300">An Error Occurred</p>
        <p className="text-center text-red-600 dark:text-red-400 mt-1">{message}</p>
        <button onClick={onRetry} className="mt-6 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
            Try Again
        </button>
    </div>
);

const TestContainer: React.FC<TestContainerProps> = ({ testType, onComplete, onBack }) => {
    const [testData, setTestData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTest = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let data;
            switch (testType) {
                case TestType.GRAMMAR_VOCABULARY:
                    data = await generateGrammarAndVocabularyTest();
                    break;
                case TestType.READING:
                    data = await generateReadingTest();
                    break;
                case TestType.WRITING:
                    data = await generateWritingTest();
                    break;
                case TestType.SPEAKING:
                    data = await generateSpeakingTest();
                    break;
                case TestType.LISTENING:
                    data = await generateListeningTest();
                    break;
                default:
                    throw new Error("Unknown test type");
            }
            setTestData(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [testType]);

    useEffect(() => {
        loadTest();
    }, [loadTest]);

    if (isLoading) {
        return <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg"><ErrorDisplay message={error} onRetry={loadTest} /></div>;
    }
    
    const renderTestComponent = () => {
        if (!testData) return null;

        switch (testType) {
            case TestType.GRAMMAR_VOCABULARY:
                return <GrammarVocabularyTest questions={testData as MCQ[]} onComplete={onComplete} onBack={onBack}/>;
            case TestType.READING:
                return <ReadingTest tasks={testData as ReadingTask[]} onComplete={onComplete} onBack={onBack}/>;
            case TestType.WRITING:
                 return <WritingTest tasks={testData as WritingTask[]} onComplete={onComplete} onBack={onBack}/>;
            case TestType.SPEAKING:
                 return <SpeakingTest tasks={testData as SpeakingTask[]} onComplete={onComplete} onBack={onBack}/>;
            case TestType.LISTENING:
                return <ListeningTest tasks={testData as ListeningTask[]} onComplete={onComplete} onBack={onBack}/>;
            default:
                return <p>No test component available for this type.</p>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-4 md:p-8 rounded-lg shadow-lg">
            {renderTestComponent()}
        </div>
    );
};

export default TestContainer;