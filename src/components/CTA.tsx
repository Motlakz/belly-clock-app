import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const CTA: React.FC = () => {
    const [isToggled, setIsToggled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [showSignUp, setShowSignUp] = useState(false);
    const [toggleCount, setToggleCount] = useState(0);
    const navigate = useNavigate();

    const springConfig = { type: "spring", stiffness: 700, damping: 30 };

    const fallVariants = {
        visible: { opacity: 1, y: 0, rotate: 0 },
        hidden: { 
        opacity: 0, 
        y: 1000, 
        rotate: 20, 
        transition: { 
            duration: 0.5, 
            ease: "easeIn" 
        } 
        },
    };

    const handleToggle = () => {
        setIsVisible(false);
        setTimeout(() => {
        setIsToggled(!isToggled);
        setIsVisible(true);
        setToggleCount(prevCount => prevCount + 1);
        }, 500);
    };

    useEffect(() => {
        if (toggleCount === 2) {
        setShowSignUp(true);
        }
    }, [toggleCount]);

    const handleSignUp = () => {
        navigate('/sign-up');
    };

    return (
        <section id="discover" className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
            <motion.h1 
            className="sm:text-4xl text-2xl font-bold mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            >
            Ready to Transform Your Fasting Experience?
            </motion.h1>
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <p className="mb-4">Toggle between fasting and eating periods:</p>
            <AnimatePresence mode="wait">
                {isVisible && (
                <motion.div
                    className="flex flex-col items-center"
                    variants={fallVariants}
                    initial="visible"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.button
                    className={`w-24 h-10 rounded-full ${isToggled ? 'bg-green-500' : 'bg-red-500'} relative`}
                    onClick={handleToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    >
                    <motion.div
                        className="w-8 h-8 bg-white rounded-full absolute top-1 left-1"
                        animate={{ x: isToggled ? 56 : 0 }}
                        transition={springConfig}
                    />
                    </motion.button>
                    <motion.p 
                    className="mt-4 font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    >
                    {isToggled ? "Eating Period" : "Fasting Period"}
                    </motion.p>
                </motion.div>
                )}
            </AnimatePresence>
            </div>
            <motion.p
            className="mt-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            >
            {isToggled ? "Great choice! Let's get you started on your eating period." : "Join thousands of successful fasters today!"}
            </motion.p>
            
            <AnimatePresence>
            {showSignUp && (
                <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="mt-8"
                >
                <motion.button
                    className="bg-purple-600 text-blue-200 font-bold sm:py-3 sm:px-8 p-3 rounded-full sm:text-xl shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(255,255,255)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignUp}
                >
                    Let's get started on that consistency!
                </motion.button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
        </section>
    );
};
