import React from 'react';
import { motion } from 'framer-motion';

interface PulsingElementProps {
  className: string;
}

const PulsingElement: React.FC<PulsingElementProps> = ({ className }) => (
    <motion.div
        className={`relative ${className}`}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
        <motion.div
            className="absolute inset-0 bg-white opacity-20 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
    </motion.div>
);

const AppScreenLoading: React.FC = () => {
    return (
        <motion.div
            className="sm:px-12 px-8 py-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 min-h-screen mt-16 sm:mt-20 rounded-t-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <article className="text-center text-gray-700">
                <PulsingElement className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-8" />
                <PulsingElement className="h-6 w-96 bg-gray-200 rounded-lg mx-auto mb-6" />
            </article>
            
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-8">
                {[1, 2, 3, 4].map((index) => (
                    <motion.div 
                        key={index} 
                        className="bg-white rounded-lg shadow-md p-6"
                        initial={{ opacity: 0.5, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <PulsingElement className="h-40 bg-gray-200 rounded-lg mb-4" />
                        <PulsingElement className="h-6 w-3/4 bg-gray-200 rounded-lg mb-2" />
                        <PulsingElement className="h-4 w-full bg-gray-200 rounded-lg mb-2" />
                        <PulsingElement className="h-4 w-2/3 bg-gray-200 rounded-lg" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AppScreenLoading;
