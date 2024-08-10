/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastingTypes } from '../lib/fastingMethods';
import CustomSelect from '../components/CustomSelect';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface FastingTimerProps {
    userId: string;
    onFastingSessionEnd: (duration: number, method: string) => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ userId, onFastingSessionEnd }) => {
    const [isActive, setIsActive] = useState(false);
    const [time, setTime] = useState(0);
    const [selectedFastingType, setSelectedFastingType] = useState(fastingTypes[0]);
    const [customHours, setCustomHours] = useState(16);
    const [customMinutes, setCustomMinutes] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const duration = selectedFastingType.name === 'Custom' 
        ? (customHours * 60 * 60) + (customMinutes * 60)
        : selectedFastingType.duration;

        useEffect(() => {
            const fetchFastingPreferences = async () => {
                try {
                    const userDocRef = doc(db, 'users', userId);
                    const userDocSnap = await getDoc(userDocRef);
        
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        const { preferredMethod, customFastingWindow } = userData.fastingPreferences || {};
                        
                        if (preferredMethod) {
                            const selectedType = fastingTypes.find(type => type.name === preferredMethod) || fastingTypes[0];
                            setSelectedFastingType(selectedType);
                        }
                        
                        if (customFastingWindow) {
                            const [hours, minutes] = customFastingWindow.split(':');
                            setCustomHours(Number(hours));
                            setCustomMinutes(Number(minutes));
                        }
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching fasting preferences:', error);
                }
            };
        
            fetchFastingPreferences();
        }, [userId]);

        useEffect(() => {
            const userDocRef = doc(db, 'users', userId);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    const userData = doc.data();
                    const { preferredMethod, customFastingWindow } = userData.fastingPreferences || {};
                    
                    if (preferredMethod) {
                        const selectedType = fastingTypes.find(type => type.name === preferredMethod) || fastingTypes[0];
                        setSelectedFastingType(selectedType);
                    }
                    
                    if (customFastingWindow) {
                        const [hours, minutes] = customFastingWindow.split(':');
                        setCustomHours(Number(hours));
                        setCustomMinutes(Number(minutes));
                    }
                }
            });
        
            // Cleanup function to unsubscribe when component unmounts
            return () => unsubscribe();
        }, [userId]);
        
        useEffect(() => {
            let interval: NodeJS.Timeout | null = null;
        
            if (isActive && startTime) {
                interval = setInterval(() => {
                    const now = new Date();
                    const elapsedTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
                    setTime(elapsedTime);
        
                    if (elapsedTime % 3600 === 0) {
                        playSound('start');
                    }
        
                    if (elapsedTime >= duration) {
                        setIsActive(false);
                        playSound('complete');
                        stopFastingSession();
                    }
                }, 1000);
            } else if (!isActive && time !== 0) {
                if (interval) clearInterval(interval);
            }
        
            return () => {
                if (interval) clearInterval(interval);
            };
        }, [isActive, startTime, duration, time]);

        const toggleTimer = async () => {
            if (isActive) {
                await stopFastingSession();
                setIsActive(false);
            } else {
                const now = new Date();
                if (startTime) {
                    // Resume the timer
                    const pausedDuration = now.getTime() - startTime.getTime();
                    setStartTime(new Date(now.getTime() - pausedDuration));
                } else {
                    // Start a new timer
                    setStartTime(now);
                    await startFastingSession(now);
                }
                setIsActive(true);
                playSound('start');
            }
        };

    const startFastingSession = async (startTime: Date) => {
        const method = selectedFastingType.name;
        const customFastingWindow = method === 'Custom' 
            ? `${customHours.toString().padStart(2, '0')}:${customMinutes.toString().padStart(2, '0')}`
            : null; // Use null instead of undefined

        // Store the session in Firestore
        const sessionData = {
            startTime: startTime,
            method,
            customFastingWindow,
        };

        try {
            const sessionRef = doc(db, `users/${userId}/fastingSessions`, `${startTime.getTime()}`);
            await setDoc(sessionRef, sessionData);
            setSessionId(sessionRef.id);
        } catch (error) {
            console.error('Error starting fasting session:', error);
        }
    };

    const stopFastingSession = async () => {
        if (!sessionId) return;

        try {
            const endTime = new Date();
            const durationInSeconds = time;

            // Update the session in Firestore
            const sessionRef = doc(db, `users/${userId}/fastingSessions`, sessionId);
            await setDoc(sessionRef, { endTime, duration: durationInSeconds }, { merge: true });

            onFastingSessionEnd(durationInSeconds, selectedFastingType.name);
            setSessionId(null);
            setStartTime(null);
        } catch (error) {
            console.error('Error stopping fasting session:', error);
        }
    };
    
    const resetTimer = async () => {
        setIsActive(false);
        setTime(0);
        setStartTime(null);
        playSound('reset');

        if (sessionId) {
            await stopFastingSession();
            onFastingSessionEnd(time, selectedFastingType.name);
        }
    };

    const formatTime = (timeInSeconds: number) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = (time / duration) * 100;

    const playSound = (soundType: 'start' | 'click' | 'reset' | 'complete') => {
        if (audioRef.current) {
            audioRef.current.src = `/sounds/${soundType}.mp3`;
            audioRef.current.load(); // Ensure the audio is loaded
            audioRef.current.play().catch(error => {
                console.error('Error playing sound:', error);
                // Attempt to play again after user interaction if it's an autoplay issue
                if (error.name === 'NotAllowedError') {
                    const playAttempt = setInterval(() => {
                        audioRef.current?.play()
                            .then(() => {
                                clearInterval(playAttempt);
                            })
                            .catch(() => {
                                console.log("Auto-play still not allowed");
                            });
                    }, 1000);
                }
            });
        }
    };

    return (
        <div className="min-h-screen z-20 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-300 to-cyan-200 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white bg-opacity-20 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white border-opacity-30"
            >
                <motion.h2 
                    className="text-3xl font-bold mb-6 text-center text-slate-700"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                >
                    Belly Clock
                </motion.h2>
                <motion.div 
                    className="w-64 h-64 rounded-full flex justify-center items-center mx-auto mb-8 relative"
                    style={{ 
                        background: `conic-gradient(#06b6d4 ${progress}%, rgba(224, 242, 254, 0.3) ${progress}% 100%)` 
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <motion.div 
                        className="absolute inset-2 bg-white/20 backdrop-blur-md rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    />
                    <motion.div 
                        className="relative flex justify-center items-center text-3xl font-bold text-slate-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {formatTime(time)}
                    </motion.div>
                </motion.div>
                <div className="space-y-4" ref={dropdownRef}>
                    <CustomSelect
                        options={fastingTypes}
                        selectedOption={selectedFastingType}
                        onSelect={(option) => {
                            setSelectedFastingType(option);
                        }}
                    />
                    {selectedFastingType.name === 'Custom' && (
                        <div className="flex space-x-2">
                            <input 
                                type="number" 
                                className="w-1/2 p-2 rounded bg-cyan-800/30 text-white border border-white border-opacity-30 placeholder-white placeholder-opacity-70"
                                value={customHours}
                                onChange={(e) => {
                                    setCustomHours(Number(e.target.value));
                                }}
                                placeholder="Hours"
                                min="0"
                                max="23"
                            />
                            <input 
                                type="number" 
                                className="w-1/2 p-2 rounded bg-cyan-800/30 text-white border border-white border-opacity-30 placeholder-white placeholder-opacity-70"
                                value={customMinutes}
                                onChange={(e) => {
                                    setCustomMinutes(Number(e.target.value));
                                }}
                                placeholder="Minutes"
                                min="0"
                                max="59"
                            />
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        <motion.button 
                            key={isActive ? 'click' : 'start'}
                            onClick={toggleTimer}
                            className="w-full px-4 py-2 bg-cyan-500 bg-opacity-80 text-white rounded-lg hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isActive ? 'Pause' : 'Start'}
                        </motion.button>
                    </AnimatePresence>
                    <motion.button 
                        onClick={resetTimer}
                        className="w-full px-4 py-2 bg-yellow-500 bg-opacity-80 text-white rounded-lg hover:bg-opacity-100 transition-colors backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                    >
                        Reset
                    </motion.button>
                </div>
            </motion.div>
            <audio ref={audioRef} />
        </div>
    );
};

export default FastingTimer;
