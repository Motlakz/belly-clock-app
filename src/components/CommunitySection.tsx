import React, { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GiBookCover } from 'react-icons/gi';
import { FaLock, FaGlobe, FaChevronDown, FaTimes } from 'react-icons/fa';

interface Option {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    label: string;
    icon: React.ReactNode;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, label, icon }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (optionValue: string) => {
        const event = {
            target: {
                id: label.toLowerCase().replace(' ', ''),
                value: optionValue
            }
        } as ChangeEvent<HTMLSelectElement>;
        onChange(event);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <label className="block text-orange-700 font-medium mb-2">{label}</label>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 bg-white rounded-md border border-orange-300 flex items-center justify-between text-orange-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span className="flex items-center">
                    {icon}
                    <span className="ml-2">{options.find(opt => opt.value === value)?.label}</span>
                </span>
                <FaChevronDown className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-orange-300 rounded-md shadow-lg"
                    >
                        {options.map((option) => (
                            <motion.button
                                key={option.value}
                                onClick={() => handleChange(option.value)}
                                className="w-full p-2 text-left text-orange-700 hover:bg-orange-100 flex items-center"
                                whileHover={{ backgroundColor: "#FFECD1" }}
                            >
                                {option.icon}
                                <span className="ml-2">{option.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    label: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        const event = {
            target: {
                id: 'challengePreferences',
                value: newValue
            }
        } as unknown as ChangeEvent<HTMLSelectElement>;
        onChange(event);
    };

    return (
        <div className="relative">
            <label className="block text-orange-700 font-medium mb-2">{label}</label>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 bg-white rounded-md border border-orange-300 flex items-center justify-between text-orange-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <span>{value.length ? `${value.length} selected` : 'Select preferences'}</span>
                <FaChevronDown className={`transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </motion.button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-orange-300 rounded-md shadow-lg"
                    >
                        {options.map((option) => (
                            <motion.button
                                key={option.value}
                                onClick={() => handleToggle(option.value)}
                                className="w-full p-2 text-left text-orange-700 hover:bg-orange-100 flex items-center justify-between"
                                whileHover={{ backgroundColor: "#FFECD1" }}
                            >
                                <span>{option.label}</span>
                                {value.includes(option.value) && <FaTimes className="text-orange-500" />}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="mt-2 flex flex-wrap gap-2">
                {value.map((v) => (
                    <motion.span
                        key={v}
                        className="bg-orange-200 text-orange-700 px-2 py-1 rounded-full text-sm flex items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        {options.find(opt => opt.value === v)?.label}
                        <FaTimes
                            className="ml-1 cursor-pointer"
                            onClick={() => handleToggle(v)}
                        />
                    </motion.span>
                ))}
            </div>
        </div>
    );
};

interface Profile {
    journalPrivacy?: string;
    challengePreferences?: string[];
}

interface CommunitySectionProps {
    activeTab: string;
    profile: Profile;
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ activeTab, profile, handleInputChange }) => {
    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const privacyOptions: Option[] = [
        { value: 'private', label: 'Private', icon: <FaLock className="text-orange-500 mr-2" /> },
        { value: 'public', label: 'Public', icon: <FaGlobe className="text-orange-500 mr-2" /> },
    ];

    const challengeOptions: Option[] = [
        { value: 'weight-loss', label: 'Weight Loss' },
        { value: 'mental-clarity', label: 'Mental Clarity' },
        { value: 'energy-boost', label: 'Energy Boost' },
        { value: 'health-improvement', label: 'Health Improvement' },
    ];

    return (
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate={activeTab === "community" ? "visible" : "hidden"}
        >
            {activeTab === "community" && (
                <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-4 mb-6">
                        <GiBookCover className="text-orange-500 text-3xl" />
                        <h3 className="text-2xl font-semibold text-orange-600">Community & Journal</h3>
                    </div>
                    <div className="space-y-6">
                        <CustomDropdown
                            options={privacyOptions}
                            value={profile.journalPrivacy || 'private'}
                            onChange={handleInputChange}
                            label="Journal Privacy"
                            icon={profile.journalPrivacy === 'private' ? <FaLock className="text-orange-500" /> : <FaGlobe className="text-orange-500" />}
                        />
                        <MultiSelect
                            options={challengeOptions}
                            value={profile.challengePreferences || []}
                            onChange={handleInputChange}
                            label="Challenge Preferences"
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CommunitySection;
