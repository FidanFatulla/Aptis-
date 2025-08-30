
import React, { useState, useEffect } from 'react';

interface TestHeaderProps {
    title: string;
    durationInSeconds: number;
    onTimeUp: () => void;
    currentQuestion: number;
    totalQuestions: number;
}

const TestHeader: React.FC<TestHeaderProps> = ({ title, durationInSeconds, onTimeUp, currentQuestion, totalQuestions }) => {
    const [timeLeft, setTimeLeft] = useState(durationInSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400">{title}</h2>
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full text-lg font-mono font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTime(timeLeft)}</span>
                </div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}>
                </div>
            </div>
        </div>
    );
};

export default TestHeader;