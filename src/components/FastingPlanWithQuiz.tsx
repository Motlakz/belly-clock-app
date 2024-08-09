import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaWeight, FaBolt, FaBrain, FaCarrot, FaBreadSlice, FaLeaf } from 'react-icons/fa';

const FastingPlanWithQuiz = () => {
    const [step, setStep] = useState(1);
    const [fastingTime, setFastingTime] = useState(16);
    const [goal, setGoal] = useState('');
    const [dietaryRestrictions, setDietaryRestrictions] = useState('');

    const handleNext = () => setStep(step + 1);
    const handlePrevious = () => setStep(step - 1);

    const goals = [
        { icon: <FaWeight />, text: 'Weight Loss' },
        { icon: <FaBolt />, text: 'Increase Energy' },
        { icon: <FaBrain />, text: 'Improved Focus' },
    ];

    const dietaryOptions = [
        { icon: <FaCarrot />, text: 'Vegan' },
        { icon: <FaLeaf />, text: 'Vegetarian' },
        { icon: <FaBreadSlice />, text: 'Gluten-Free' },
        { icon: null, text: 'None' },
    ];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    useEffect(() => {
        if (goal) {
            setTimeout(() => setStep(3), 500);
        }
    }, [goal]);

    useEffect(() => {
        if (dietaryRestrictions) {
            setTimeout(() => window.location.href = '/sign-up', 500);
        }
    }, [dietaryRestrictions]);

    return (
        <motion.div
            className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-md w-full overflow-x-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AnimatePresence custom={step}>
                <motion.div
                    key={step}
                    custom={step}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                >
                    {step === 1 && (
                        <div className="text-center">
                            <motion.h3 
                                className="text-2xl font-bold mb-6 text-white"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <FaClock className="inline-block mr-2 mb-1" />
                                How many hours do you typically fast?
                            </motion.h3>
                            <motion.div 
                                className="flex items-center justify-center mb-8"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <button 
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-l-full transition-colors hover:bg-indigo-700"
                                    onClick={() => setFastingTime(Math.max(12, fastingTime - 1))}
                                >
                                    -
                                </button>
                                <div className="bg-white text-indigo-600 px-8 py-2 font-bold text-xl">
                                    {fastingTime} hours
                                </div>
                                <button 
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-r-full transition-colors hover:bg-indigo-700"
                                    onClick={() => setFastingTime(Math.min(20, fastingTime + 1))}
                                >
                                    +
                                </button>
                            </motion.div>
                            <motion.button
                                className="bg-indigo-600 text-white py-2 px-6 rounded-full transition-colors hover:bg-indigo-700"
                                onClick={handleNext}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Next
                            </motion.button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="text-center">
                            <motion.h3 
                                className="text-2xl font-bold mb-6 text-white"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                What is your main goal?
                            </motion.h3>
                            <div className="grid grid-cols-1 gap-4">
                                {goals.map((item, index) => (
                                    <motion.button
                                        key={item.text}
                                        className={`mt-2 bg-indigo-600 text-white py-3 px-6 rounded-full flex items-center justify-center transition-colors ${
                                            goal === item.text ? 'bg-indigo-400' : 'hover:bg-indigo-700'
                                        }`}
                                        onClick={() => setGoal(item.text)}
                                        whileHover={{ scale: 1.05 }}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        {item.icon}
                                        <span className="ml-2">{item.text}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="text-center">
                            <motion.h3 
                                className="text-2xl font-bold mb-6 text-white"
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Do you have any dietary restrictions?
                            </motion.h3>
                            <div className="grid grid-cols-1 gap-4">
                                {dietaryOptions.map((item, index) => (
                                    <motion.button
                                        key={item.text}
                                        className={`mt-2 bg-indigo-600 text-white py-3 px-6 rounded-full flex items-center justify-center transition-colors ${
                                            dietaryRestrictions === item.text ? 'bg-indigo-400' : 'hover:bg-indigo-700'
                                        }`}
                                        onClick={() => setDietaryRestrictions(item.text)}
                                        whileHover={{ scale: 1.05 }}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        {item.icon && <span className="mr-2">{item.icon}</span>}
                                        {item.text}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            
            {step > 1 && (
                <motion.button
                    className="mt-8 bg-gray-600 text-white py-2 px-6 rounded-full transition-colors hover:bg-gray-700"
                    onClick={handlePrevious}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Back
                </motion.button>
            )}
        </motion.div>
    );
};

export default FastingPlanWithQuiz;
