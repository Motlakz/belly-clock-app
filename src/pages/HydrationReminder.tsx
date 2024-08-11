import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiWaterDrop, GiHourglass } from 'react-icons/gi';
import { FaToggleOn, FaToggleOff, FaBell, FaPlus, FaMinus, FaHistory, FaStopwatch } from 'react-icons/fa';
import { db } from '../firebase';
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { generateWaterIntakeGuidance, WaterIntakeGuidanceParams } from '../lib/waterIntakeGuide';
import ReactMarkdown from "react-markdown";

interface HydrationReminderProps {
    userId: string;
}

interface WaterIntake {
    timestamp: number;
    amount: number;
}

const HydrationReminder: React.FC<HydrationReminderProps> = ({ userId }) => {
    const [reminderFrequency, setReminderFrequency] = useState(60);
    const [lastReminder, setLastReminder] = useState(Date.now());
    const [hydrationRemindersEnabled, setHydrationRemindersEnabled] = useState(true);
    const [dailyGoal, setDailyGoal] = useState(2000); // ml
    const [currentIntake, setCurrentIntake] = useState(0);
    const [intakeHistory, setIntakeHistory] = useState<WaterIntake[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [waterGuidance, setWaterGuidance] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userParams, setUserParams] = useState<WaterIntakeGuidanceParams>({
        fastingType: { name: 'Intermittent 16/8', duration: 16 * 3600, icon: '🕰️' },
        weight: 70,
        activityLevel: 'moderate',
        climate: 'temperate'
    });

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserParams(prev => ({ ...prev, [name]: value }));
    };

    const generateGuidance = async () => {
        setIsLoading(true);
        try {
            const guidance = await generateWaterIntakeGuidance(userParams);
            setWaterGuidance(guidance);
        } catch (error) {
            console.error('Error generating water intake guidance:', error);
            setWaterGuidance('Failed to generate guidance. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchHydrationPreferences = async () => {
            try {
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setReminderFrequency(data.reminderFrequency || 60);
                    setHydrationRemindersEnabled(data.hydrationReminders !== false);
                    setDailyGoal(data.dailyWaterGoal || 2000);
                    setCurrentIntake(data.currentWaterIntake || 0);
                    setIntakeHistory(data.waterIntakeHistory || []);
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching hydration preferences:', error);
            }
        };

        fetchHydrationPreferences();
    }, [userId]);

    const saveReminderFrequency = async (frequency: number) => {
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                reminderFrequency: frequency
            });
        } catch (error) {
            console.error('Error saving reminder frequency:', error);
        }
    };

    const saveHydrationRemindersEnabled = async (enabled: boolean) => {
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                hydrationReminders: enabled
            });
        } catch (error) {
            console.error('Error saving hydration reminders state:', error);
        }
    };

    const sendNotification = useCallback(async () => {
        console.log('Attempting to send notification');
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                console.log('Notification permission is granted');
                new Notification('Hydration Reminder', {
                    body: `Time to drink some water! You've had ${currentIntake}ml out of your ${dailyGoal}ml goal.`,
                    icon: '/water-icon.png'
                });
    
                // Add notification to Firestore
                try {
                    await addDoc(collection(db, 'users', userId, 'notifications'), {
                        type: 'hydration',
                        message: `Time to drink some water! You've had ${currentIntake}ml out of your ${dailyGoal}ml goal.`,
                        timestamp: Timestamp.now()
                    });
                    console.log('Notification added to Firestore');
                } catch (error) {
                    console.error('Error adding notification:', error);
                }
    
                // Update lastReminder
                setLastReminder(Date.now());
            } else if (Notification.permission !== 'denied') {
                console.log('Requesting notification permission');
                await requestNotificationPermission();
            } else {
                console.log('Notification permission is denied');
            }
        } else {
            console.log('Notifications are not supported in this browser');
        }
    }, [currentIntake, dailyGoal, userId]);

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
            } else {
                console.log('Notification permission denied');
            }
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        setLastReminder(Date.now());
    }, []);

    useEffect(() => {
        if (!hydrationRemindersEnabled) {
            console.log('Hydration reminders are disabled');
            return;
        }
    
        console.log('Setting up reminder check interval');
        console.log('Current reminder frequency:', reminderFrequency);
        console.log('Last reminder time:', new Date(lastReminder));
    
        const checkReminder = () => {
            const now = Date.now();
            console.log('Checking reminder at:', new Date(now));
            if (now - lastReminder >= reminderFrequency * 60 * 1000) {
                console.log('Time to send a notification!');
                sendNotification();
                setLastReminder(now);
            } else {
                console.log('Not time for a notification yet');
            }
        };
    
        // Check immediately when the component mounts or when dependencies change
        checkReminder();
    
        // Set up an interval to check every minute
        const intervalId = setInterval(checkReminder, 60 * 1000);
    
        return () => {
            console.log('Clearing reminder check interval');
            clearInterval(intervalId);
        };
    }, [reminderFrequency, lastReminder, hydrationRemindersEnabled, sendNotification]);

    const updateWaterIntake = async (amount: number) => {
        const newIntake = Math.max(0, currentIntake + amount);
        setCurrentIntake(newIntake);
        const newIntakeHistory = [
            ...intakeHistory,
            { timestamp: Date.now(), amount: amount }
        ];
        setIntakeHistory(newIntakeHistory);

        // Update Firestore
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                currentWaterIntake: newIntake,
                waterIntakeHistory: newIntakeHistory
            });
        } catch (error) {
            console.error('Error updating water intake:', error);
        }
    };

    const resetDailyIntake = async () => {
        setCurrentIntake(0);
        setIntakeHistory([]);

        // Update Firestore
        try {
            const docRef = doc(db, 'users', userId);
            await updateDoc(docRef, {
                currentWaterIntake: 0,
                waterIntakeHistory: []
            });
        } catch (error) {
            console.error('Error resetting water intake:', error);
        }
    };

    // Calculate daily average intake
    const calculateAverageIntake = () => {
        if (intakeHistory.length === 0) return 0;
        const totalIntake = intakeHistory.reduce((sum, intake) => sum + intake.amount, 0);
        return totalIntake / intakeHistory.length;
    };

    const averageIntake = calculateAverageIntake();
    const intakePercentage = ((currentIntake / dailyGoal) * 100).toFixed(2);

    return (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-cyan-800 to-blue-600 p-4 relative overflow-hidden rounded-lg">
            <FloatingDroplets containerRef={containerRef} />
            <div className="flex sm:flex-row flex-col w-full max-w-6xl space-x-4 mt-24">
                {/* Hydration Reminder (Left Side) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="sm:w-1/2 bg-blue-400/30 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-300 border-opacity-30 relative"
                >
                    <motion.h2 
                        className="text-3xl font-bold mb-6 text-center text-blue-100 flex items-center justify-center"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                    >
                        <GiWaterDrop className="mr-2 text-blue-300" />
                        Hydration Tracker
                    </motion.h2>
                    <div className="flex flex-col space-y-4">
                        <motion.div 
                            className="flex items-center justify-between"
                            whileHover={{ scale: 1.02 }}
                        >
                            <label htmlFor="hydrationToggle" className="text-lg font-medium text-blue-200 flex items-center">
                                <FaBell className="mr-2" />
                                Enable Reminders
                            </label>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const newState = !hydrationRemindersEnabled;
                                    setHydrationRemindersEnabled(newState);
                                    saveHydrationRemindersEnabled(newState);
                                }}
                            >
                                {hydrationRemindersEnabled ? 
                                    <FaToggleOn className="text-3xl text-blue-300" /> : 
                                    <FaToggleOff className="text-3xl text-gray-400" />
                                }
                            </motion.button>
                        </motion.div>
                        <AnimatePresence>
                            {hydrationRemindersEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label htmlFor="reminderFrequency" className="text-lg font-medium text-blue-200 mb-2 flex items-center">
                                        <GiHourglass className="mr-2" />
                                        Reminder Frequency (minutes)
                                    </label>
                                    <motion.input
                                        type="number"
                                        id="reminderFrequency"
                                        value={reminderFrequency}
                                        onChange={(e) => {
                                            const newFrequency = parseInt(e.target.value);
                                            setReminderFrequency(newFrequency);
                                            saveReminderFrequency(newFrequency);
                                        }}
                                        className="w-full p-3 mb-4 bg-blue-900 bg-opacity-50 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-400 text-blue-100 placeholder-blue-300"
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="bg-blue-500/30 p-4 rounded-lg">
                            <h3 className="text-xl font-bold text-blue-100 mb-2">Daily Progress</h3>
                            <p className="text-blue-200">{currentIntake} / {dailyGoal} ml</p>
                            <p className="text-blue-200">Intake Percentage: {intakePercentage}%</p>
                            <p className="text-blue-200">Average Intake: {averageIntake.toFixed(2)} ml</p>
                            <div className="w-full bg-blue-200 rounded-full h-2.5 dark:bg-blue-700 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${intakePercentage}%` }}></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateWaterIntake(-250)}
                                className="bg-red-500 text-white p-2 rounded-full"
                            >
                                <FaMinus />
                            </motion.button>
                            <span className="text-blue-100 text-lg font-bold">250ml</span>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateWaterIntake(250)}
                                className="bg-green-500 text-white p-2 rounded-full"
                            >
                                <FaPlus />
                            </motion.button>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetDailyIntake}
                            className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                        >
                            <FaHistory className="mr-2" />
                            Reset Daily Intake
                        </motion.button>
                    </div>
                </motion.div>
    
                {/* Water Fasting Guide (Right Side) */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="sm:w-1/2 bg-blue-400/30 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-300 border-opacity-30 relative overflow-y-auto max-h-[100vh]"
                >
                    <motion.h2 
                        className="text-3xl font-bold mb-6 text-center text-blue-100 flex items-center justify-center"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                    >
                        <FaStopwatch className="mr-2 text-blue-300" />
                        Water Fasting Guide
                    </motion.h2>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-bold mb-2 text-blue-100">Generate Personalized Water Intake Guidance</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="text-blue-200">Fasting Type</label>
                                <select 
                                    name="fastingType" 
                                    value={userParams.fastingType.name}
                                    onChange={(e) => setUserParams(prev => ({ ...prev, fastingType: { name: e.target.value, duration: 16 * 3600, icon: '🕰️' } }))}
                                    className="w-full p-2 bg-blue-900 bg-opacity-50 text-blue-100 rounded"
                                >
                                    <option value="Intermittent 16/8">Intermittent 16/8</option>
                                    <option value="OMAD">OMAD</option>
                                    <option value="Extended Fast">Extended Fast</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-200">Weight (kg)</label>
                                <input 
                                    type="number" 
                                    name="weight"
                                    value={userParams.weight}
                                    onChange={handleParamChange}
                                    className="w-full p-2 bg-blue-900 bg-opacity-50 text-blue-100 rounded"
                                />
                            </div>
                            <div>
                                <label className="text-blue-200">Activity Level</label>
                                <select 
                                    name="activityLevel"
                                    value={userParams.activityLevel}
                                    onChange={handleParamChange}
                                    className="w-full p-2 bg-blue-900 bg-opacity-50 text-blue-100 rounded"
                                >
                                    <option value="sedentary">Sedentary</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-blue-200">Climate</label>
                                <select 
                                    name="climate"
                                    value={userParams.climate}
                                    onChange={handleParamChange}
                                    className="w-full p-2 bg-blue-900 bg-opacity-50 text-blue-100 rounded"
                                >
                                    <option value="temperate">Temperate</option>
                                    <option value="hot">Hot</option>
                                    <option value="cold">Cold</option>
                                </select>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={generateGuidance}
                                disabled={isLoading}
                                className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 transition duration-300 flex items-center justify-center"
                            >
                                {isLoading ? 'Generating...' : 'Generate Water Intake Guidance'}
                            </motion.button>
                        </form>
                    </div>

                    {waterGuidance && (
                        <div className="mt-6 bg-blue-500/30 p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-2 text-blue-100">Your Personalized Water Intake Guidance</h3>
                            <ReactMarkdown className="text-blue-200 prose prose-invert">
                                {waterGuidance}
                            </ReactMarkdown>
                        </div>
                    )}

                    <div className="text-blue-200">
                        <h3 className="text-xl font-bold mb-2">Fasting Tips:</h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Stay hydrated with water and electrolytes</li>
                            <li>Listen to your body and break fast if feeling unwell</li>
                            <li>Gradually increase fasting duration over time</li>
                            <li>Consult with a healthcare professional before starting</li>
                            <li>Break your fast with light, easily digestible foods</li>
                            <li>Avoid intense physical activities during extended fasts</li>
                            <li>Use this time to focus on mental clarity and meditation</li>
                            <li>Keep yourself occupied to avoid focusing on hunger</li>
                        </ul>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-2 text-blue-100">Benefits of Water Fasting:</h3>
                        <ul className="list-disc list-inside space-y-2 text-blue-200">
                            <li>Promotes autophagy (cellular repair)</li>
                            <li>May improve insulin sensitivity</li>
                            <li>Potential weight loss and fat burning</li>
                            <li>May reduce inflammation in the body</li>
                            <li>Can lead to improved mental clarity</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FloatingDroplet: React.FC<{ containerSize: { width: number; height: number } }> = ({ containerSize }) => (
    <motion.div
        className="absolute text-blue-300 opacity-50 pointer-events-none"
        initial={{ 
            x: Math.random() * containerSize.width, 
            y: Math.random() * containerSize.height,
            fontSize: '30px'
        }}
        animate={{ 
            x: [
                Math.random() * containerSize.width,
                Math.random() * containerSize.width,
                Math.random() * containerSize.width,
                Math.random() * containerSize.width
            ],
            y: [
                Math.random() * containerSize.height,
                Math.random() * containerSize.height,
                Math.random() * containerSize.height,
                Math.random() * containerSize.height
            ],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            fontSize: ['10px', '20px', '30px', '20px', '10px']
        }}
        transition={{ 
            duration: Math.random() * 20 + 10, 
            repeat: Infinity, 
            repeatType: "reverse" 
        }}
    >
        💧
    </motion.div>
);

const FloatingDroplets: React.FC<{ containerRef: React.RefObject<HTMLDivElement> }> = ({ containerRef }) => {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [containerRef]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, index) => (
                <FloatingDroplet key={index} containerSize={containerSize} />
            ))}
        </div>
    );
};

export default HydrationReminder;
