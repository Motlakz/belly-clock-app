import React from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaRobot, FaMicrophone } from 'react-icons/fa';

interface ToggleSwitchProps {
    id: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label: string;
    icon: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, checked, onChange, label, icon }) => {
    return (
        <label htmlFor={id} className="flex items-center cursor-pointer group">
            <div className="relative">
                <input
                    type="checkbox"
                    id={id}
                    className="sr-only"
                    checked={checked}
                    onChange={onChange}
                />
                <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner transition-colors duration-300 ease-in-out group-hover:bg-gray-400">
                </div>
                <div className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${checked ? 'translate-x-5 bg-teal-400' : 'bg-orange-500'}`}>
                </div>
            </div>
            <div className="ml-3 text-orange-700 font-medium flex items-center">
                {icon}
                <span className="ml-2">{label}</span>
            </div>
        </label>
    );
};

interface AdvancedSectionProps {
    activeTab: string;
    profile: {
        aiCoachEnabled?: boolean;
        voiceCommandsEnabled?: boolean;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdvancedSection: React.FC<AdvancedSectionProps> = ({ activeTab, profile, handleInputChange }) => {
    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate={activeTab === "advanced" ? "visible" : "hidden"}
        >
            {activeTab === "advanced" && (
                <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-4 mb-6">
                        <FaBell className="text-orange-500 text-3xl" />
                        <h3 className="text-2xl font-semibold text-orange-600">Advanced Features</h3>
                    </div>
                    <motion.div 
                        className="space-y-6"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    >
                        <motion.div variants={itemVariants}>
                            <ToggleSwitch
                                id="aiCoachEnabled"
                                checked={profile.aiCoachEnabled || false}
                                onChange={handleInputChange}
                                label="Enable AI Coaching"
                                icon={<FaRobot className="text-orange-500 mr-2" />}
                            />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <ToggleSwitch
                                id="voiceCommandsEnabled"
                                checked={profile.voiceCommandsEnabled || false}
                                onChange={handleInputChange}
                                label="Enable Voice Commands"
                                icon={<FaMicrophone className="text-orange-500 mr-2" />}
                            />
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default AdvancedSection;
