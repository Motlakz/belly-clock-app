import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiWaterDrop, GiHourglass } from 'react-icons/gi';
import { FaToggleOn, FaToggleOff, FaBell, FaPlus, FaMinus, FaHistory } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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

    const sendNotification = useCallback(async () => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Hydration Reminder', {
                    body: `Time to drink some water! You've had ${currentIntake}ml out of your ${dailyGoal}ml goal.`,
                    icon: '/water-icon.png'
                });
            } else if (Notification.permission !== 'denied') {
                await requestNotificationPermission();
            }
        }
    }, [currentIntake, dailyGoal]); // Include dependencies

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
        if (!hydrationRemindersEnabled) return;

        const checkReminder = setInterval(() => {
            const now = Date.now();
            if (now - lastReminder >= reminderFrequency * 60 * 1000) {
                sendNotification(); // Call the notification function
                setLastReminder(now);
            }
        }, 60000);

        return () => clearInterval(checkReminder);
    }, [reminderFrequency, lastReminder, hydrationRemindersEnabled, sendNotification]); // Include sendNotification

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

    return (
        <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-cyan-800 to-blue-600 p-4 relative overflow-hidden rounded-lg">
            <FloatingDroplets containerRef={containerRef} />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-blue-400/30 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-300 border-opacity-30 relative"
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
                            onClick={() => setHydrationRemindersEnabled(!hydrationRemindersEnabled)}
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
                                    onChange={(e) => setReminderFrequency(parseInt(e.target.value))}
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
                        <div className="w-full bg-blue-200 rounded-full h-2.5 dark:bg-blue-700 mt-2">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(currentIntake / dailyGoal) * 100}%` }}></div>
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
