/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { generateStressQuestions, getStressManagementSuggestions, StressQuestion } from '../lib/stressFeedback';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface StressProfile {
    suggestions?: string[];
    stressLevel: number;
    answers: { questionId: number; score: number; feedback?: string }[];
    date: string;
    additionalFeedback?: string;
}

const StressChecker: React.FC = () => {
    const { user } = useUser();
    const [questions, setQuestions] = useState<StressQuestion[]>([]);
    const [stressLevel, setStressLevel] = useState(0);
    const [, setSuggestions] = useState<string[]>([]);
    const [persistentStressLevel, setPersistentStressLevel] = useState(0);
    const [persistentSuggestions, setPersistentSuggestions] = useState<string[]>([]);
    const [suggestionsFetched, setSuggestionsFetched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [previousResponses, setPreviousResponses] = useState<StressProfile[]>([]);
    const [isChartUpdated, setIsChartUpdated] = useState(false);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    const [todayRecorded, setTodayRecorded] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [additionalFeedback,] = useState('');

    useEffect(() => {
        if (user) {
            fetchPreviousResponses();
            fetchQuestions();
        }
    }, [user]);
    
    useEffect(() => {
        const totalScore = questions.reduce((sum, q) => sum + (q.score ?? 0), 0);
        setStressLevel((totalScore / (questions.length * 4)) * 100);
        
        // Check if all questions are answered
        if (questions.length > 0 && questions.every(q => q.score !== undefined)) {
            setAllQuestionsAnswered(true);
        } else {
            setAllQuestionsAnswered(false);
        }
    }, [questions]);
    
    useEffect(() => {
        const getSuggestions = async () => {
            setIsLoading(true);
            const scores = questions.map(q => q.score ?? 0);
            const managementSuggestions = await getStressManagementSuggestions(scores);
            setSuggestions(managementSuggestions);
            setIsLoading(false);
            setSuggestionsFetched(true);
    
            if (user && !todayRecorded) {
                const today = new Date().toISOString().split('T')[0];
                const profile: StressProfile = {
                    stressLevel,
                    answers: questions.map(q => ({ 
                        questionId: q.id, 
                        score: q.score ?? 0,
                        feedback: q.feedback
                    })),
                    date: today,
                    additionalFeedback
                };
                await updateUserProfile(profile);
    
                setIsChartUpdated(true);
                setTodayRecorded(true);
            }
        };
    
        if (stressLevel > 0 && allQuestionsAnswered && !isChartUpdated && showResults && !suggestionsFetched) {
            getSuggestions();
        }
    }, [stressLevel, allQuestionsAnswered, user, todayRecorded, isChartUpdated, questions, showResults, suggestionsFetched, additionalFeedback]);
    
    const fetchPreviousResponses = async () => {
        if (user) {
            const userDoc = doc(db, 'users', user.id);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const profiles = userData.stressProfiles || [];
                setPreviousResponses(profiles);

                // Check if today's stress level is already recorded
                const today = new Date().toISOString().split('T')[0];
                const todayProfile = profiles.find((profile: StressProfile) => profile.date === today);
                if (todayProfile) {
                    setPersistentStressLevel(todayProfile.stressLevel);
                    setPersistentSuggestions(todayProfile.suggestions || []);
                    setStressLevel(todayProfile.stressLevel);
                    setTodayRecorded(true);
                    setShowResults(true);
                    setSuggestionsFetched(true);
                }
            }
        }
    };

    const fetchQuestions = async () => {
        const fetchedQuestions = await generateStressQuestions();
        setQuestions(fetchedQuestions);
    };

    const handleScoreChange = (id: number, score: number) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, score } : q));
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleFeedbackChange = (id: number, feedback: string) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, feedback } : q));
    };

    const updateUserProfile = async (profile: StressProfile) => {
        if (user) {
            const userDoc = doc(db, 'users', user.id);
            const updatedProfiles = previousResponses.filter(p => p.date !== profile.date);
            await setDoc(userDoc, {
                stressProfiles: [...updatedProfiles, profile]
            }, { merge: true });
            
            // Update persistent data
            setPersistentStressLevel(profile.stressLevel);
            setPersistentSuggestions(profile.suggestions || []);

            // Fetch updated responses after saving
            await fetchPreviousResponses();
        }
    };

    const handleSubmit = async () => {
        if (allQuestionsAnswered) {
            setIsLoading(true);
            const scores = questions.map(q => q.score ?? 0);
            const managementSuggestions = await getStressManagementSuggestions(scores);
            
            const profile: StressProfile = {
                stressLevel,
                answers: questions.map(q => ({ 
                    questionId: q.id, 
                    score: q.score || 0,
                    ...(q.feedback && { feedback: q.feedback })
                })),
                date: new Date().toISOString().split('T')[0],
                ...(additionalFeedback && { additionalFeedback }),
                suggestions: managementSuggestions
            };
    
            // Remove any undefined or null values
            const cleanProfile = Object.fromEntries(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(profile).filter(([_, v]) => v != null)
            ) as StressProfile;
    
            await updateUserProfile(cleanProfile);
            setShowResults(true);
            setSuggestions(managementSuggestions);
            setSuggestionsFetched(true);
            setIsLoading(false);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const getEmoticonForScore = (score: number) => {
        const emoticons = ['😌', '😊', '😐', '😟', '😰'];
        return emoticons[score];
    };

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthlyResponses = previousResponses.filter(profile => {
        const responseDate = new Date(profile.date);
        return responseDate >= startOfMonth && responseDate <= endOfMonth;
    });

    const chartData = {
        labels: monthlyResponses.map(profile => profile.date),
        datasets: [
            {
                label: 'Stress Level',
                data: monthlyResponses.map(profile => profile.stressLevel),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Stress Level for This Month',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <div className="max-w-4xl mx-auto sm:p-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-2xl">
            <motion.h1 
                className="sm:text-4xl text-2xl font-bold mb-8 text-center text-indigo-600"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Stress Checker 🧘‍♀️
            </motion.h1>
            
            {user ? (
                <>
                    <motion.p 
                        className="mb-6 sm:text-lg text-center text-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Welcome, {user.firstName}! Let's check your stress levels. 🌟
                    </motion.p>
                    
                    {!todayRecorded && (
                        <>
                            <motion.div 
                                className="mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <AnimatePresence mode="wait">
                                    {questions.length > 0 && (
                                        <motion.div 
                                            key={currentQuestionIndex}
                                            className="bg-white sm:p-6 p-2 rounded-lg shadow-md"
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="mb-4 font-medium sm:text-lg">{questions[currentQuestionIndex].text}</p>
                                            <div className="flex justify-between items-center mb-4">
                                                {[0, 1, 2, 3, 4].map((score) => (
                                                    <motion.button
                                                        key={score}
                                                        onClick={() => handleScoreChange(questions[currentQuestionIndex].id, score)}
                                                        className={`p-2 sm:p-4 sm:gap-8 max-w-12 sm:max-w-20 lg:max-w-24 w-full rounded-full transition-all duration-200 flex flex-col gap-2 justify-center items-center ${
                                                            questions[currentQuestionIndex].score === score 
                                                                ? 'bg-indigo-500 text-white' 
                                                                : 'bg-gray-200 hover:bg-gray-300'
                                                        }`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <span className="text-2xl mb-1">{getEmoticonForScore(score)}</span>
                                                        <span className="border border-indigo-300 p-2 rounded-full max-w-10 w-full">{score}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <div className="mb-4">
                                                <label htmlFor={`feedback-${questions[currentQuestionIndex].id}`} className="block mb-2 font-medium text-gray-700">
                                                    Additional Feedback (Optional):
                                                </label>
                                                <textarea
                                                    id={`feedback-${questions[currentQuestionIndex].id}`}
                                                    name={`feedback-${questions[currentQuestionIndex].id}`}
                                                    rows={3}
                                                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                                                    placeholder="Any additional thoughts or feelings about this question..."
                                                    value={questions[currentQuestionIndex].feedback || ''}
                                                    onChange={(e) => handleFeedbackChange(questions[currentQuestionIndex].id, e.target.value)}
                                                ></textarea>
                                            </div>
                                            <div className="mt-6 flex sm:flex-row flex-col gap-2 justify-between items-center">
                                                <button 
                                                    onClick={handlePreviousQuestion}
                                                    disabled={currentQuestionIndex === 0}
                                                    className={`px-4 py-2 rounded-full ${currentQuestionIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                                                >
                                                    Previous
                                                </button>
                                                <span className="text-gray-600">
                                                    Question {currentQuestionIndex + 1} of {questions.length}
                                                </span>
                                                {currentQuestionIndex === questions.length - 1 && (
                                                    <button
                                                        onClick={handleSubmit}
                                                        disabled={!allQuestionsAnswered}
                                                        className={`px-4 py-2 rounded-full ${
                                                            allQuestionsAnswered ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        Submit
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </>
                    )}
    
                    {(showResults || todayRecorded) && (
                        <>
                            <motion.div 
                                className="mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <h2 className="sm:text-2xl text-lg text-center font-semibold mb-4">Your Stress Level for Today:</h2>
                                <motion.div
                                    className="h-8 bg-gray-200 rounded-full overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-400 to-red-500" // Fixed gradient color scheme
                                        initial={{ width: 0 }}
                                        animate={{ width: `${persistentStressLevel}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.div>
                                <motion.p 
                                    className="mt-2 text-xl font-medium text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                >
                                    {persistentStressLevel.toFixed(2)}% {persistentStressLevel < 30 ? '😌' : persistentStressLevel < 60 ? '😐' : '😰'}
                                </motion.p>
                            </motion.div>


                            <motion.div 
                                className="mb-8 h-64"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 0.5 }}
                            >
                                <Bar options={chartOptions} data={chartData} />
                            </motion.div>

                            <motion.div 
                                className="mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                            >
                                <h2 className="text-2xl font-semibold mb-4">Stress Management Suggestions:</h2>
                                {isLoading ? (
                                    <div className="mb-4 flex flex-col items-center justify-center">
                                        <p>Loading suggestions...</p>
                                        <div className="mt-2 w-8 h-8 border-4 border-t-cyan-400 border-r-pink-400 border-b-orange-400 border-l-purple-500 rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <motion.ul 
                                        className="list-disc pl-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {persistentSuggestions.map((suggestion, index) => (
                                            <li key={index} className="mb-2">{suggestion}</li>
                                        ))}
                                    </motion.ul>
                                )}
                            </motion.div>
                        </>
                    )}
                </>
            ) : (
                <motion.p 
                    className="text-xl text-red-500 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Please sign in to use the Stress Checker. 🔐
                </motion.p>
            )}
        </div>
    );
};

export default StressChecker;
