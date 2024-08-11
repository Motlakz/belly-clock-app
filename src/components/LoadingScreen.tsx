import React, { memo } from 'react';
import { motion } from 'framer-motion';

const PulsingElement: React.FC<{ className: string }> = memo(({ className }) => (
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
));

const LoadingScreen: React.FC = () => {
    return (
        <motion.div
            className="fixed inset-0 z-50 bg-gradient-to-b from-blue-50 to-purple-100 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Hero Section Skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-screen flex items-center justify-center text-center">
                <div className="w-3/4 max-w-7xl">
                    <PulsingElement className="h-12 bg-white bg-opacity-20 rounded-lg mb-4" />
                    <PulsingElement className="h-6 bg-white bg-opacity-20 rounded-lg max-w-5xl w-full mb-8 text-center" />
                    <PulsingElement className="h-12 bg-white bg-opacity-20 rounded-full max-w-md w-full mx-auto" />
                </div>
            </div>

            {/* Features Section Skeleton */}
            <div className="py-20 bg-gradient-to-r from-purple-100 to-blue-100">
                <div className="container mx-auto px-4">
                    <PulsingElement className="h-8 bg-purple-200 rounded-lg w-1/2 mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, index) => (
                            <motion.div 
                                key={index} 
                                className="bg-white bg-opacity-50 p-8 rounded-lg shadow-lg"
                                initial={{ opacity: 0.5, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <PulsingElement className="h-12 w-12 bg-purple-200 rounded-full mb-4 mx-auto" />
                                <PulsingElement className="h-6 bg-purple-200 rounded-lg w-3/4 mx-auto mb-2" />
                                <PulsingElement className="h-4 bg-purple-200 rounded-lg w-full mx-auto" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interactive Demo Section Skeleton */}
            <section id="quiz" className="py-20 bg-gradient-to-r from-blue-500 to-purple-500">
                <div className="container mx-auto px-4 flex items-center justify-center flex-col text-center text-white">
                    <PulsingElement className="h-10 bg-white bg-opacity-20 rounded-lg w-3/4 mb-8" />
                    <div className="w-full max-w-2xl">
                        <PulsingElement className="h-64 bg-white bg-opacity-20 rounded-lg mb-4" />
                        <PulsingElement className="h-12 bg-white bg-opacity-20 rounded-full w-1/2 mx-auto" />
                    </div>
                </div>
            </section>

            {/* Pricing Section Skeleton */}
            <div className="bg-purple-100 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <PulsingElement className="h-10 bg-purple-200 rounded-lg w-3/4 mx-auto mb-4" />
                        <PulsingElement className="h-6 bg-purple-200 rounded-lg w-1/2 mx-auto" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, index) => (
                            <motion.div
                                key={index}
                                className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-200"
                                initial={{ opacity: 0.5, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <PulsingElement className="h-8 bg-purple-200 rounded-lg w-1/2 mb-4" />
                                <PulsingElement className="h-10 bg-purple-200 rounded-lg w-3/4 mb-6" />
                                <div className="space-y-3 mb-8">
                                    {[...Array(4)].map((_, i) => (
                                        <PulsingElement key={i} className="h-4 bg-purple-200 rounded-lg w-full" />
                                    ))}
                                </div>
                                <PulsingElement className="h-10 bg-purple-400 rounded-lg w-full" />
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                        <PulsingElement className="h-8 bg-purple-200 rounded-lg w-1/2 mx-auto mb-6" />
                        <div className="grid md:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <PulsingElement className="h-16 w-16 bg-purple-200 rounded-full mb-4" />
                                    <PulsingElement className="h-6 bg-purple-200 rounded-lg w-3/4 mb-2" />
                                    <PulsingElement className="h-4 bg-purple-200 rounded-lg w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section Skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <PulsingElement className="h-10 bg-white bg-opacity-20 rounded-lg w-3/4 mx-auto mb-6" />
                        <PulsingElement className="h-6 bg-white bg-opacity-20 rounded-lg w-1/2 mx-auto mb-8" />
                        <PulsingElement className="h-12 bg-white bg-opacity-20 rounded-full max-w-md w-full mx-auto" />
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <footer className="bg-indigo-100 text-indigo-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        {[...Array(4)].map((_, index) => (
                            <div key={index}>
                                <PulsingElement className="h-6 bg-indigo-200 rounded-lg w-1/2 mb-4" />
                                <div className="space-y-2">
                                    {[...Array(4)].map((_, i) => (
                                        <PulsingElement key={i} className="h-4 bg-indigo-200 rounded-lg w-3/4" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-indigo-200 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <PulsingElement className="h-6 bg-indigo-200 rounded-lg w-3/4 mb-2" />
                                <div className="flex">
                                    <PulsingElement className="h-10 bg-indigo-200 rounded-l-lg w-48" />
                                    <PulsingElement className="h-10 bg-indigo-400 rounded-r-lg w-24" />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                {[...Array(4)].map((_, index) => (
                                    <PulsingElement key={index} className="h-6 w-6 bg-indigo-200 rounded-full" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 text-center">
                        <PulsingElement className="h-4 bg-indigo-200 rounded-lg w-3/4 mx-auto" />
                    </div>
                </div>
            </footer>
        </motion.div>
    );
};

export default LoadingScreen;
