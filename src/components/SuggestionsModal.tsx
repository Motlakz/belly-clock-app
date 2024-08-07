import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    generateSuggestions: () => Promise<string[]>;
}

const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ isOpen, onClose, generateSuggestions }) => {
    const [showModal, setShowModal] = useState(true);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadSuggestions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const newSuggestions = await generateSuggestions();
            setSuggestions(newSuggestions);
        } catch (error) {
            console.error("Failed to load suggestions:", error);
            setError("Failed to load suggestions. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [generateSuggestions]);

    useEffect(() => {
        const lastShownDate = localStorage.getItem('lastShownDate');
        const today = new Date().toISOString().split('T')[0];

        if (lastShownDate !== today) {
            setShowModal(true);
            localStorage.setItem('lastShownDate', today);
            loadSuggestions();
        }
    }, [loadSuggestions]);

    return (
        <AnimatePresence>
            {showModal && isOpen && (
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
                        {loading && (
                            <div className="mb-4">
                                <p>Loading suggestions...</p>
                                <div className="mt-2 w-8 h-8 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        {error && (
                            <p className="text-red-500 mb-4">{error}</p>
                        )}
                        {suggestions.length > 0 && (
                            <ul className="list-disc pl-5 mb-4">
                                {suggestions.map((suggestion, index) => (
                                    <li key={index} className="mb-2">{suggestion}</li>
                                ))}
                            </ul>
                        )}
                        {!loading && suggestions.length === 0 && !error && (
                            <p className="mb-4">No suggestions available at the moment.</p>
                        )}
                        <button
                            onClick={() => {
                                onClose();
                                setShowModal(false);
                            }}
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
