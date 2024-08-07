import React from 'react';

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
    if (!isVisible) return null;

    return (
        <div className="absolute z-10 bg-white border border-gray-300 rounded shadow-lg p-2">
            <div className="flex flex-wrap">
                {emojis.map((emoji) => (
                    <button
                        key={emoji.label}
                        onClick={() => {
                            onSelect(emoji.emoji);
                            onClose(); // Close the picker after selection
                        }}
                        className={`text-3xl p-2 ${selectedEmotion === emoji.emoji ? 'bg-orange-200' : ''}`}
                        aria-label={emoji.label}
                    >
                        {emoji.emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;
