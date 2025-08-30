
import React from 'react';
import { TestType } from '../types';

interface ResultsProps {
  results: { score: number; total: number; testType: TestType };
  onBackToDashboard: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, onBackToDashboard }) => {
  const { score, total, testType } = results;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const isGraded = testType === TestType.GRAMMAR_VOCABULARY || testType === TestType.READING || testType === TestType.LISTENING;

  const getFeedback = () => {
    if (!isGraded) return "Your responses have been saved. Well done for completing the section!";
    if (percentage >= 80) return "Excellent work! You have a strong command of this area.";
    if (percentage >= 60) return "Good job! You're on the right track. Keep practicing to improve further.";
    if (percentage >= 40) return "You've made a good start, but there's room for improvement. Reviewing the basics will help.";
    return "This seems to be a challenging area. Consistent practice will make a big difference.";
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Test Complete!</h2>
      <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-6">{testType}</p>
      
      {isGraded ? (
        <>
            <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        className="text-slate-200 dark:text-slate-700"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="text-primary-600"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${percentage}, 100`}
                        strokeLinecap="round"
                        transform="rotate(-90 18 18)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{percentage}%</span>
                    <span className="text-slate-500 dark:text-slate-400">{score} / {total}</span>
                </div>
            </div>
        </>
      ) : (
        <div className="my-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
      )}

      <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg">{getFeedback()}</p>

      <button
        onClick={onBackToDashboard}
        className="mt-8 w-full sm:w-auto bg-primary-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-all duration-300"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Results;