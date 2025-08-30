
import React, { useState, useCallback } from 'react';
import { TestType } from './types';
import Dashboard from './components/Dashboard';
import TestContainer from './components/TestContainer';
import Results from './components/Results';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'test' | 'results'>('dashboard');
    const [activeTest, setActiveTest] = useState<TestType | null>(null);
    const [testResults, setTestResults] = useState<{ score: number; total: number; testType: TestType } | null>(null);

    const handleStartTest = useCallback((testType: TestType) => {
        setActiveTest(testType);
        setTestResults(null);
        setCurrentView('test');
    }, []);

    const handleTestComplete = useCallback((results: { score: number; total: number; testType: TestType }) => {
        setTestResults(results);
        setCurrentView('results');
    }, []);

    const handleBackToDashboard = useCallback(() => {
        setActiveTest(null);
        setTestResults(null);
        setCurrentView('dashboard');
    }, []);

    const renderContent = () => {
        switch (currentView) {
            case 'test':
                if (activeTest) {
                    return <TestContainer testType={activeTest} onComplete={handleTestComplete} onBack={handleBackToDashboard}/>;
                }
                // Fallback to dashboard if test is not active
                return <Dashboard onStartTest={handleStartTest} />;
            case 'results':
                if (testResults) {
                    return <Results results={testResults} onBackToDashboard={handleBackToDashboard} />;
                }
                // Fallback to dashboard if results are not available
                return <Dashboard onStartTest={handleStartTest} />;
            case 'dashboard':
            default:
                return <Dashboard onStartTest={handleStartTest} />;
        }
    };

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
           <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">UNEC Aptis Practice Portal</h1>
                </div>
            </header>
            <main className="p-4 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
