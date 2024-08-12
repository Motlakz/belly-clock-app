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
import Loader from './Loader';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface StressProfile {
    stressLevel: number;
    answers: { questionId: number; score: number }[];
    date: string; // Store date as a string in YYYY-MM-DD format
}

const StressChecker: React.FC = () => {
    const { user } = useUser();
    const [questions, setQuestions] = useState<StressQuestion[]>([]);
    const [stressLevel, setStressLevel] = useState(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [previousResponses, setPreviousResponses] = useState<StressProfile[]>([]);
    const [isChartUpdated, setIsChartUpdated] = useState(false);
    const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
    const [todayRecorded, setTodayRecorded] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPreviousResponses();
            fetchQuestions();
        }
    }, [user]);

    useEffect(() => {
        const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
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
            const scores = questions.map(q => q.score);
            const managementSuggestions = await getStressManagementSuggestions(scores);
            setSuggestions(managementSuggestions);
            setIsLoading(false);

            if (user && !todayRecorded) {
                const today = new Date().toISOString().split('T')[0];
                const profile: StressProfile = {
                    stressLevel,
                    answers: questions.map(q => ({ questionId: q.id, score: q.score })),
                    date: today
                };
                await updateUserProfile(profile);

                // Trigger chart update after the profile is saved
                setIsChartUpdated(true);
                setTodayRecorded(true);
            }
        };

        if (stressLevel > 0 && allQuestionsAnswered && !isChartUpdated && showResults) {
            getSuggestions();
        }
    }, [stressLevel, allQuestionsAnswered, user, todayRecorded, isChartUpdated, questions, showResults]);

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
                const todayProfile = profiles.find((profile: { date: string; }) => profile.date === today);
                if (todayProfile) {
                    setStressLevel(todayProfile.stressLevel);
                    setTodayRecorded(true);
                    setShowResults(true);
                }
            }
        }
    };

    const updateUserProfile = async (profile: StressProfile) => {
        if (user) {
            const userDoc = doc(db, 'users', user.id);
            const updatedProfiles = previousResponses.filter(p => p.date !== profile.date);
            await setDoc(userDoc, {
                stressProfiles: [...updatedProfiles, profile]
            }, { merge: true });
            
            // Fetch updated responses after saving
            await fetchPreviousResponses();
        }
    };

    const fetchQuestions = async () => {
        const fetchedQuestions = await generateStressQuestions();
        setQuestions(fetchedQuestions);
    };

    const handleScoreChange = (id: number, score: number) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, score } : q));
    };

    const handleSubmit = () => {
        if (allQuestionsAnswered) {
            setShowResults(true);
        }
    };

    // Filter previous responses to only include this month's data
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
        <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-2xl">
            <motion.h1 
                className="sm:text-4xl text-2xl font-bold mb-8 text-center text-indigo-600"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Stress Checker
            </motion.h1>
            
            {user ? (
                <>
                    <motion.p 
                        className="mb-6 sm:text-lg text-center text-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        Welcome, {user.firstName}! Let's check your stress levels.
                    </motion.p>
                    
                    {!todayRecorded && (
                        <>
                            <motion.div 
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <AnimatePresence>
                                    {questions.map((q) => (
                                        <motion.div 
                                            key={q.id} 
                                            className="bg-white p-6 rounded-lg shadow-md"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <p className="mb-4 font-medium">{q.text}</p>
                                            <div className="flex justify-between">
                                                {[0, 1, 2, 3, 4].map((score) => (
                                                    <motion.button
                                                        key={score}
                                                        onClick={() => handleScoreChange(q.id, score)}
                                                        className={`px-4 py-2 rounded-full transition-all duration-200 ${
                                                            q.score === score 
                                                                ? 'bg-indigo-500 text-white' 
                                                                : 'bg-gray-200 hover:bg-gray-300'
                                                        }`}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        {score}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                            <motion.button
                                onClick={handleSubmit}
                                disabled={!allQuestionsAnswered}
                                className={`w-full py-3 rounded-full text-white font-semibold transition-all duration-200 ${
                                    allQuestionsAnswered ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-400 cursor-not-allowed'
                                }`}
                                whileHover={allQuestionsAnswered ? { scale: 1.05 } : {}}
                                whileTap={allQuestionsAnswered ? { scale: 0.95 } : {}}
                            >
                                Submit Answers
                            </motion.button>
                        </>
                    )}

                    {showResults && (
                        <>
                            <motion.div 
                                className="mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <h2 className="sm:text-2xl text-lg text-center font-semibold mb-4">Your Stress Level for Today:</h2>
                                <motion.div
                                    className="h-6 bg-gray-200 rounded-full overflow-hidden"
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-400 to-red-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stressLevel}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </motion.div>
                                <motion.p 
                                    className="mt-2 text-xl font-medium text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                >
                                    {stressLevel.toFixed(2)}%
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
                                    <>
                                        <Loader />
                                        <p className="text-center text-gray-600">Generating suggestions...</p>
                                    </>
                                ) : (
                                    <motion.ul 
                                        className="list-disc pl-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {suggestions.map((suggestion, index) => (
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
                    Please sign in to use the Stress Checker.
                </motion.p>
            )}
        </div>
    );
};

export default StressChecker;
