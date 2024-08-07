import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: string[];
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, suggestions }) => {
    return (
        <AnimatePresence>
        {isOpen && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full"
            >
                <h2 className="text-2xl font-bold mb-4">Your Fasting Suggestions</h2>
                <ul className="list-disc pl-5 mb-4">
                {suggestions.map((suggestion, index) => (
                    <li key={index} className="mb-2">{suggestion}</li>
                ))}
                </ul>
                <button
                onClick={onClose}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                >
                Close
                </button>
            </motion.div>
            </motion.div>
        )}
        </AnimatePresence>
    );
};

export default SuggestionsModal;
