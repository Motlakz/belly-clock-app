import React, { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { GiBookCover } from 'react-icons/gi';
import { FaLock, FaGlobe, FaTimes } from 'react-icons/fa';
import MotionSelect from './MotionSelect';

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

    const privacyOptions = [
        { value: 'private', label: 'Private', icon: <FaLock className="text-orange-500 mr-2" /> },
        { value: 'public', label: 'Public', icon: <FaGlobe className="text-orange-500 mr-2" /> },
    ];

    const challengeOptions = [
        { value: 'weight-loss', label: 'Weight Loss' },
        { value: 'mental-clarity', label: 'Mental Clarity' },
        { value: 'energy-boost', label: 'Energy Boost' },
        { value: 'health-improvement', label: 'Health Improvement' },
    ];

    const handlePrivacyChange = (option: { value: string; label: string }) => {
        handleInputChange({
            target: { id: 'journalPrivacy', value: option.value }
        } as ChangeEvent<HTMLSelectElement>);
    };

    const handleChallengePreferencesChange = (option: { value: string; label: string }) => {
        const newPreferences = profile.challengePreferences?.includes(option.value)
            ? profile.challengePreferences.filter(pref => pref !== option.value)
            : [...(profile.challengePreferences || []), option.value];
        
        handleInputChange({
            target: { id: 'challengePreferences', value: newPreferences }
        } as unknown as ChangeEvent<HTMLSelectElement>);
    };

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
                        <MotionSelect
                            options={privacyOptions}
                            selectedOption={privacyOptions.find(opt => opt.value === profile.journalPrivacy) || privacyOptions[0]}
                            onSelect={handlePrivacyChange}
                            label="Journal Privacy"
                        />
                        <div>
                            <label className="block text-orange-700 font-medium mb-2">Challenge Preferences</label>
                            <MotionSelect
                                options={challengeOptions}
                                selectedOption={challengeOptions[0]}
                                onSelect={handleChallengePreferencesChange}
                                label=""
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {profile.challengePreferences?.map((pref) => (
                                    <motion.span
                                        key={pref}
                                        className="bg-orange-200 text-orange-700 px-2 py-1 rounded-full text-sm flex items-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        {challengeOptions.find(opt => opt.value === pref)?.label}
                                        <FaTimes
                                            className="ml-1 cursor-pointer"
                                            onClick={() => handleChallengePreferencesChange({ value: pref, label: '' })}
                                        />
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default CommunitySection;
