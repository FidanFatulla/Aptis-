
import React, { useState, useMemo } from 'react';
import { ReadingTask, TestType } from '../../types';
import TestHeader from '../TestHeader';

interface ReadingTestProps {
    tasks: ReadingTask[];
    onComplete: (results: { score: number, total: number, testType: TestType }) => void;
    onBack: () => void;
}

const ReadingTest: React.FC<ReadingTestProps> = ({ tasks, onComplete, onBack }) => {
    // This component will only handle the first task for simplicity.
    const task = tasks[0];
    const { questions } = task;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = answer;
        setUserAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        const score = userAnswers.reduce((totalScore, answer, index) => {
            if (answer === questions[index].correctAnswer) {
                return totalScore + 1;
            }
            return totalScore;
        }, 0);
        onComplete({ score, total: questions.length, testType: TestType.READING });
    };

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    return (
        <div>
            <TestHeader
                title="Reading"
                durationInSeconds={35 * 60}
                onTimeUp={handleSubmit}
                currentQuestion={currentQuestionIndex}
                totalQuestions={questions.length}
            />
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:border-r lg:pr-8 dark:border-slate-700">
                    <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                    <div className="prose prose-slate dark:prose-invert max-w-none h-96 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md">
                        <p>{task.passage}</p>
                    </div>
                </div>
                <div>
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <h4 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h4>
                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <label
                                key={index}
                                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                                    userAnswers[currentQuestionIndex] === option
                                        ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500'
                                        : 'bg-white dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 hover:border-primary-400'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestionIndex}`}
                                    value={option}
                                    checked={userAnswers[currentQuestionIndex] === option}
                                    onChange={() => handleAnswerSelect(option)}
                                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-slate-300"
                                />
                                <span className="ml-3 text-base">{option}</span>
                            </label>
                        ))}
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
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className="py-2 px-6 rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    {currentQuestionIndex < questions.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="py-2 px-8 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                        >
                            Next
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

export default ReadingTest;