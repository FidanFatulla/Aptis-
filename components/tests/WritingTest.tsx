
import React, { useState, useMemo } from 'react';
import { WritingTask, TestType } from '../../types';
import TestHeader from '../TestHeader';

interface WritingTestProps {
    tasks: WritingTask[];
    onComplete: (results: { score: number, total: number, testType: TestType }) => void;
    onBack: () => void;
}

const WritingTest: React.FC<WritingTestProps> = ({ tasks, onComplete, onBack }) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [userResponses, setUserResponses] = useState<string[]>(Array(tasks.length).fill(''));
    
    const currentTask = useMemo(() => tasks[currentTaskIndex], [tasks, currentTaskIndex]);
    const currentResponse = userResponses[currentTaskIndex];
    const wordCount = currentResponse.trim().split(/\s+/).filter(Boolean).length;

    const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newResponses = [...userResponses];
        newResponses[currentTaskIndex] = e.target.value;
        setUserResponses(newResponses);
    };

    const handleNext = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        }
    };
    
    const handleSubmit = () => {
        onComplete({ score: tasks.length, total: tasks.length, testType: TestType.WRITING });
    };

    return (
        <div>
            <TestHeader
                title="Writing"
                durationInSeconds={50 * 60}
                onTimeUp={handleSubmit}
                currentQuestion={currentTaskIndex}
                totalQuestions={tasks.length}
            />

            <div className="mt-8">
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">Task {currentTaskIndex + 1} of {tasks.length}</p>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md">
                    <p className="text-lg whitespace-pre-wrap">{currentTask.instructions}</p>
                </div>
                
                <div className="mt-6">
                    <textarea
                        value={currentResponse}
                        onChange={handleResponseChange}
                        className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                        placeholder="Type your response here..."
                    />
                    <div className="text-right mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {currentTask.wordLimit ? `Word Count: ${wordCount} / ${currentTask.wordLimit}` : `Word Count: ${wordCount}`}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center border-t dark:border-slate-700 pt-6">
                <button
                    onClick={onBack}
                    className="py-2 px-4 rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Quit
                </button>
                <div className="flex space-x-4">
                     {currentTaskIndex < tasks.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="py-2 px-8 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Next Task
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="py-2 px-8 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        >
                            Finish Test
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WritingTest;
