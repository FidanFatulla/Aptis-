
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SpeakingTask, TestType } from '../../types';

interface SpeakingTestProps {
    tasks: SpeakingTask[];
    onComplete: (results: { score: number, total: number, testType: TestType }) => void;
    onBack: () => void;
}

type RecordingStatus = 'idle' | 'preparing' | 'recording' | 'recorded' | 'error';

const MicIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const StopIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" /></svg>;

const SpeakingTest: React.FC<SpeakingTestProps> = ({ tasks, onComplete, onBack }) => {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [status, setStatus] = useState<RecordingStatus>('idle');
    const [timeLeft, setTimeLeft] = useState(0);
    const [recordedAudios, setRecordedAudios] = useState<(string | null)[]>(Array(tasks.length).fill(null));
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const currentTask = useMemo(() => tasks[currentTaskIndex], [tasks, currentTaskIndex]);
    const currentAudioUrl = recordedAudios[currentTaskIndex];

    useEffect(() => {
        let timer: number;
        if ((status === 'preparing' || status === 'recording') && timeLeft > 0) {
            timer = window.setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (status === 'preparing' && timeLeft === 0) {
            startRecording();
        } else if (status === 'recording' && timeLeft === 0) {
            stopRecording();
        }
        return () => clearTimeout(timer);
    }, [status, timeLeft]);
    
    const startPreparation = async () => {
        if (status !== 'idle' && status !== 'recorded') return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const newAudios = [...recordedAudios];
                newAudios[currentTaskIndex] = audioUrl;
                setRecordedAudios(newAudios);
                audioChunksRef.current = [];
            };
            setStatus('preparing');
            setTimeLeft(currentTask.preparationTime);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus('error');
        }
    };
    
    const startRecording = () => {
        if(mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setStatus('recording');
            setTimeLeft(currentTask.recordingTime);
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setStatus('recorded');
        }
    };

    const handleNextTask = () => {
        if (currentTaskIndex < tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
            setStatus('idle');
        }
    };
    
    const handleSubmit = () => {
        onComplete({ score: tasks.length, total: tasks.length, testType: TestType.SPEAKING });
    };

    const renderStatusUI = () => {
        switch (status) {
            case 'preparing':
                return <div className="text-center"><div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Prepare to speak...</div><div className="text-5xl font-mono">{timeLeft}s</div></div>;
            case 'recording':
                return <div className="text-center"><div className="text-lg font-semibold text-red-600 dark:text-red-400 animate-pulse">Recording...</div><div className="text-5xl font-mono">{timeLeft}s</div></div>;
            case 'recorded':
                return <div className="text-center"><div className="text-lg font-semibold text-green-600 dark:text-green-400">Recording complete.</div>{currentAudioUrl && <audio controls src={currentAudioUrl} className="mt-4 mx-auto"/>}</div>;
            case 'error':
                 return <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg"><p className="font-bold text-red-700 dark:text-red-300">Microphone Error</p><p className="text-red-600 dark:text-red-400">Could not access microphone. Please check permissions and try again.</p></div>;
            case 'idle':
            default:
                return <button onClick={startPreparation} className="flex items-center justify-center w-full py-3 px-6 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"><MicIcon className="h-6 w-6 mr-2" /> Start Recording</button>;
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">Speaking</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">Task {currentTaskIndex + 1} of {tasks.length}</p>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-md mb-6 min-h-[100px]">
                <p className="text-lg">{currentTask.instructions}</p>
                {currentTask.imageUrl && <img src={currentTask.imageUrl} alt="Speaking prompt" className="mt-4 rounded-lg mx-auto max-h-64"/>}
            </div>

            <div className="flex justify-center items-center h-40 bg-slate-100 dark:bg-slate-900/50 rounded-lg">
                {renderStatusUI()}
            </div>
            
            <div className="mt-8 flex justify-between items-center border-t dark:border-slate-700 pt-6">
                <button
                    onClick={onBack}
                    className="py-2 px-4 rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Quit
                </button>
                 {currentTaskIndex < tasks.length - 1 ? (
                    <button onClick={handleNextTask} disabled={status !== 'recorded'} className="py-2 px-8 rounded-md bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next Task</button>
                ) : (
                    <button onClick={handleSubmit} disabled={status !== 'recorded'} className="py-2 px-8 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Finish Test</button>
                )}
            </div>
        </div>
    );
};

export default SpeakingTest;