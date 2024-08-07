import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface FastingType {
    name: string;
    icon: string;
    duration: number;
}

interface CustomSelectProps {
    options: FastingType[];
    selectedOption: FastingType;
    onSelect: (option: FastingType) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, selectedOption, onSelect }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-2 rounded bg-teal-50 text-teal-800 border border-teal-300 flex justify-between items-center"
            >
                <span>{selectedOption.icon} {selectedOption.name}</span>
                <FaChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-teal-300 rounded shadow-lg max-h-60 overflow-y-auto"
                    >
                        {options.map((option) => (
                            <button
                                key={option.name}
                                className="w-full p-2 text-left text-teal-700 hover:bg-teal-50 transition-colors flex items-center"
                                onClick={() => {
                                    onSelect(option);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                <span className="mr-2">{option.icon}</span>
                                {option.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
