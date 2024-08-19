import React, { useState, useEffect, useRef } from 'react';
import { FaWindowClose } from 'react-icons/fa';

interface Emoji {
    emoji: string;
    category: string;
    label: string;
}

interface EmojiPickerProps {
    emojis: Emoji[];
    selectedEmotion: string;
    onSelect: (emoji: string) => void;
    isVisible: boolean;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ emojis, selectedEmotion, onSelect, isVisible, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isVisible) return null;

    const filteredEmojis = emojis.filter(
        (emoji) =>
            emoji.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emoji.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
                ref={pickerRef}
                className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm w-full m-4 relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Close"
                >
                    <FaWindowClose size={24} />
                </button>
                <input
                    type="text"
                    placeholder="Search emojis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
                <div className="max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-6 gap-2">
                        {filteredEmojis.map((emoji) => (
                            <button
                                key={emoji.label}
                                onClick={() => {
                                    onSelect(emoji.emoji);
                                    onClose();
                                }}
                                className={`text-2xl p-2 rounded hover:bg-gray-100 transition-colors duration-200 ${
                                    selectedEmotion === emoji.emoji ? 'bg-orange-200' : ''
                                }`}
                                aria-label={emoji.label}
                                title={emoji.label}
                            >
                                {emoji.emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;
