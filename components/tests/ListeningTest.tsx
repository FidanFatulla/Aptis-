
import React, { useState, useMemo, useEffect } from 'react';
import { ListeningTask, TestType } from '../../types';
import TestHeader from '../TestHeader';

interface ListeningTestProps {
    tasks: ListeningTask[];
    onComplete: (results: { score: number, total: number, testType: TestType }) => void;
    onBack: () => void;
}

const PlayIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SpeakerIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>;

const ListeningTest: React.FC<ListeningTestProps> = ({ tasks, onComplete, onBack }) => {
    // This component will only handle the first task for simplicity.
    const task = tasks[0];
    const { questions } = task;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>(Array(questions.length).fill(null));
    const [audioState, setAudioState] = useState<'idle' | 'playing' | 'ended'>('idle');
    const [playCount, setPlayCount] = useState(0);
    const maxPlays = 2;

    // Cleanup speech synthesis on component unmount
    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);
    
    const handlePlayAudio = () => {
        if (playCount >= maxPlays || !('speechSynthesis' in window) || audioState === 'playing') {
            return;
        }

        const utterance = new SpeechSynthesisUtterance(task.transcript);
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        
        utterance.onstart = () => {
            setAudioState('playing');
        };

        utterance.onend = () => {
            setAudioState('ended');
            setPlayCount(prev => prev + 1);
        };
        
        utterance.onerror = () => {
            setAudioState('idle');
            // Maybe show an error to the user
        };

        window.speechSynthesis.speak(utterance);
    };

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
        onComplete({ score, total: questions.length, testType: TestType.LISTENING });
    };

    const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

    return (
        <div>
            <TestHeader
                title="Listening"
                durationInSeconds={40 * 60}
                onTimeUp={handleSubmit}
                currentQuestion={currentQuestionIndex}
                totalQuestions={questions.length}
            />
            <div className="mt-6 flex flex-col items-center">
                 <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg w-full max-w-lg text-center mb-6">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300">{task.instructions}</p>
                    <button 
                        onClick={handlePlayAudio}
                        disabled={playCount >= maxPlays || audioState === 'playing'}
                        className="mt-4 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={audioState === 'playing' ? 'Playing audio' : 'Play audio'}
                        >
                        {audioState === 'playing' ? <SpeakerIcon className="w-5 h-5 animate-pulse" /> : <PlayIcon className="w-5 h-5" />}
                        {audioState === 'playing' ? 'Playing...' : 'Play Audio'}
                    </button>
                    <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
                        Plays left: {maxPlays - playCount}
                    </p>
                </div>

                <div className="w-full">
                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <h4 className="text-xl font-semibold mb-4 min-h-[56px]">{currentQuestion.question}</h4>
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

export default ListeningTest;