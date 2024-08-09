import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CTA } from '../components/CTA';
import FastingPlanWithQuiz from '../components/FastingPlanWithQuiz';
import LoadingScreen from '../components/LoadingScreen';
import Footer from '../components/Footer';
import PricingComponent from '../components/PricingSection';

const FloatingShape: React.FC<{ delay?: number; className: string }> = ({ delay = 0, className }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      y: [0, -20, 0],
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay,
    }}
  />
);

const InteractiveButton: React.FC = () => (
    <motion.button 
      className="relative bg-purple-600 text-white font-bold sm:py-3 sm:px-8 p-3 rounded-full sm:text-xl hover:bg-purple-500 transition duration-300 shadow-lg overflow-hidden"
      whileHover={{ scale: 1.1, rotate: 3 }}
      whileTap={{ scale: 0.95 }}
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
    >
      {/* Smooth Pulse Effect */}
      <motion.div
        className="absolute inset-0 bg-purple-700 opacity-20 rounded-full"
        initial={{ width: '0%' }}
        animate={{ width: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Icon with Rotation */}
      <motion.span
        className="inline-block mr-3"
        initial={{ rotate: 0, scale: 1 }}
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ⏳
      </motion.span>
      
      Start Your Fasting Journey
    </motion.button>
  );  
  

const LandingPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
  
      return () => clearTimeout(timer);
    }, []);

  return (
    <AnimatePresence>
      {isLoading ? (
        <LoadingScreen key="loading" />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-100"
        >
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 min-h-screen flex items-center justify-center relative overflow-hidden">
        <FloatingShape delay={0} className="top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full" />
        <FloatingShape delay={1} className="top-40 right-20 w-32 h-32 bg-pink-300 rounded-full" />
        <FloatingShape delay={2} className="bottom-20 left-1/4 w-24 h-24 bg-green-300 rounded-full" />
        
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="sm:text-6xl text-4xl font-bold mb-4 text-shadow-lg">Free Intermittent Fasting Calculator</h1>
          <p className="sm:text-2xl mb-8 text-shadow">Optimize Your Weight Loss and Health with Precision Fasting Tools</p>
          <InteractiveButton />
        </motion.div>
      </header>

      {/* Features Section */}
        <section id="features" className="py-20 min-h-screen bg-gradient-to-r from-purple-100 to-blue-100">
            <div className="container mx-auto px-4">
                <h1 className="sm:text-4xl text-2xl font-bold mb-12 text-center text-purple-800">
                    Powerful Features for Intermittent Fasting Success
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: '⏱️', title: 'Fasting Hours Calculator', description: 'Optimize your fasting windows for maximum weight loss', color: 'from-teal-400 to-cyan-300' },
                        { icon: '📊', title: 'Weight Loss Tracker', description: 'Visualize your fasting weight loss journey with advanced analytics', color: 'from-indigo-400 to-purple-300' },
                        { icon: '💧', title: 'Water Fasting Guide', description: 'Stay perfectly hydrated during your intermittent fasts', color: 'from-blue-400 to-blue-300' },
                        { icon: '🚀', title: 'Fasting Time Optimizer', description: 'Maximize your fasting benefits with personalized schedules', color: 'from-pink-400 to-rose-300' }
                    ].map((feature, index) => (
                        <motion.div 
                            key={index}
                            className={`bg-gradient-to-br ${feature.color} p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-all duration-300 cursor-pointer`}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="relative text-5xl mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="sm:text-2xl text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                            <p className="text-white opacity-80">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <motion.a 
                        href="/sign-up"
                        className="inline-block bg-purple-600 text-white sm:py-3 sm:px-8 p-3 rounded-full sm:text-xl font-bold shadow-lg transition-all duration-300 hover:bg-purple-500"
                        whileHover={{ scale: 1.1 }}
                    >
                        Start Your Intermittent Fasting Journey
                    </motion.a>
                </div>
            </div>
        </section>

      {/* Interactive Demo Section */}
        <section id="showcase" className="py-20 bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="container mx-auto px-4 flex items-center justify-center flex-col text-center text-white">
                <h2 className="text-4xl font-bold mb-8">Experience Our Free Fasting Weight Loss Calculator</h2>
                <FastingPlanWithQuiz />
            </div>
        </section>

      {/* Pricing Section */}
      <PricingComponent/>

      {/* CTA Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </motion.div>
     )}
    </AnimatePresence>
  );
};

export default LandingPage;
