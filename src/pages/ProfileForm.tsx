import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";
import { GiPerson, GiSandsOfTime, GiWaterDrop, GiChart, GiPadlock } from "react-icons/gi";
import { FaBell, FaEdit, FaEnvelope, FaSmile, FaTrash, FaUserEdit } from "react-icons/fa";
import { fastingTypes, FastingType } from "../lib/fastingMethods";
import CommunitySection from "../components/CommunitySection";
import AdvancedSection from "../components/AdvancedSection";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserProfile, FastingHistory } from "../lib/fastingSuggestions";
import MotionSelect from "../components/MotionSelect";

interface ProfileFormProps {
    userId: string;
}

interface ExtendedUserProfile extends UserProfile {
    name?: string;
    email?: string;
    preferredMethod?: string;
    reminderFrequency?: number;
    customFastingWindow?: { start: string; end: string };
    hydrationReminders?: boolean;
    journalPrivacy?: "public" | "private";
    challengePreferences?: string[];
    aiCoachEnabled?: boolean;
    voiceCommandsEnabled?: boolean;
    stressMoodTracking?: boolean;
    subscriptionTier?: "free" | "premium";
    fastingPreferences?: {
        preferredMethod?: string;
        customFastingWindow?: { start: string; end: string };
        reminderFrequency?: number;
    };
}

const MotionInput = motion.input;

export const ProfileForm: React.FC<ProfileFormProps> = ({ userId }) => {
    const { user } = useUser();
    const [profile, setProfile] = useState<ExtendedUserProfile>({
        name: user?.fullName || '',
        email: user?.emailAddresses[0]?.emailAddress || '',
        subscriptionTier: 'free',
        age: 0,
        weight: 0,
        height: 0,
        gender: 'other',
        activityLevel: 'sedentary',
        healthConditions: [],
        fastingPreferences: {
            preferredMethod: fastingTypes[0].name,
            reminderFrequency: 4,
        },
    });
    const [activeTab, setActiveTab] = useState("general");
    const [selectedFastingType, setSelectedFastingType] = useState<FastingType>(fastingTypes[0]);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [, setFastingHistory] = useState<FastingHistory>({
        completedFasts: 0,
        averageFastDuration: 0,
        longestFast: 0,
        consistency: 0,
    });

    useEffect(() => {
        const fetchProfileAndHistory = async () => {
            if (userId) {
                const userDocRef = doc(db, "users", userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data() as ExtendedUserProfile;
                    setProfile((prevProfile) => ({
                        ...prevProfile,
                        ...userData,
                        fastingPreferences: {
                            preferredMethod: fastingTypes[0].name, // Default value
                            reminderFrequency: 4, // Default value
                            ...prevProfile.fastingPreferences,
                            ...userData.fastingPreferences,
                        },
                    }));
                    
                    // Set selected fasting type
                    const preferredMethod = userData.fastingPreferences?.preferredMethod || fastingTypes[0].name;
                    const selectedType = fastingTypes.find(type => type.name === preferredMethod) || fastingTypes[0];
                    setSelectedFastingType(selectedType);
                }
    
                const historyDocRef = doc(db, "fastingHistory", userId);
                const historyDocSnap = await getDoc(historyDocRef);
                if (historyDocSnap.exists()) {
                    setFastingHistory(historyDocSnap.data() as FastingHistory);
                }
            }
        };
        fetchProfileAndHistory();
    }, [userId, selectedFastingType]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (userId) {
            try {
                const docRef = doc(db, "users", userId);
                const updatedProfile = {
                    ...profile,
                    fastingPreferences: {
                        preferredMethod: profile.fastingPreferences?.preferredMethod || fastingTypes[0].name,
                        customFastingWindow: profile.fastingPreferences?.customFastingWindow,
                        reminderFrequency: profile.fastingPreferences?.reminderFrequency ?? 4,
                    }
                };
                await setDoc(docRef, updatedProfile, { merge: true });
                alert("Profile updated successfully!");
            } catch (error) {
                console.error("Error updating profile:", error);
                alert("An error occurred while updating your profile. Please try again.");
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type, checked } = e.target as HTMLInputElement;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [id]: type === 'checkbox' ? checked : value,
            fastingPreferences: {
                ...prevProfile.fastingPreferences,
                [id]: type === 'checkbox' ? checked : value,
            }
        }));
    };

    const handleFastingTypeChange = async (option: { value: string, label: string }) => {
        const newFastingType = fastingTypes.find(type => type.name === option.value);
        if (newFastingType && userId) {
            try {
                // Update local state
                setSelectedFastingType(newFastingType);
                setProfile(prev => ({
                    ...prev,
                    fastingPreferences: {
                        ...prev.fastingPreferences,
                        preferredMethod: newFastingType.name,
                    }
                }));
    
                // Update Firestore
                const userDocRef = doc(db, "users", userId);
                await setDoc(userDocRef, {
                    fastingPreferences: {
                        preferredMethod: newFastingType.name,
                    }
                }, { merge: true });
    
                console.log("Fasting preference updated successfully");
            } catch (error) {
                console.error("Error updating fasting preference:", error);
                alert("An error occurred while updating your fasting preference. Please try again.");
            }
        }
    };

    const handleCustomFastingWindowChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            customFastingWindow: {
                ...prevProfile.customFastingWindow,
                [id]: value,
            } as { start: string; end: string },
        }));
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmed) {
            // Implement account deletion logic here
            alert("Account deleted successfully!");
        }
    };

    const tabVariants = {
        active: { backgroundColor: "#FFA500", color: "white" },
        inactive: { backgroundColor: "#FFE4B5", color: "#FFA500" }
    };

    const contentVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-orange-100 to-yellow-100 p-8 rounded-lg shadow-lg max-w-4xl mx-auto mt-16 sm:mt-36"
        >
            <motion.h2
                className="text-4xl font-bold mb-6 text-orange-600 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                Your Fasting Journey Profile
            </motion.h2>

            <div className="flex mb-6 space-x-2 justify-center">
                {["general", "health", "fasting", "tracking", "community", "advanced", "subscription"].map((tab) => (
                    <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        variants={tabVariants}
                        animate={activeTab === tab ? "active" : "inactive"}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </motion.button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate={activeTab === "general" ? "visible" : "hidden"}
                >
                    {activeTab === "general" && (
                        <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-4 mb-4">
                                <GiPerson className="text-orange-500 text-xl" />
                                <h3 className="text-2xl font-semibold text-orange-600">General Information</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-orange-700 font-semibold">Name: {profile.name || 'Not set'}</span>
                                        <motion.button
                                            type="button"
                                            onClick={() => setEditMode(editMode === 'name' ? null : 'name')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <FaEdit className="text-orange-500" />
                                        </motion.button>
                                    </div>
                                    <AnimatePresence>
                                        {editMode === 'name' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <MotionInput
                                                    type="text"
                                                    id="name"
                                                    value={profile.name || ''}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full focus:outline-orange-400 rounded-md text-orange-900 bg-orange-600/20 border-orange-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 py-3 px-4 text-lg"
                                                    whileFocus={{ scale: 1.02 }}
                                                    autoFocus
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-orange-700 font-semibold">Email: {profile.email || 'Not set'}</span>
                                        <motion.button
                                            type="button"
                                            onClick={() => setEditMode(editMode === 'email' ? null : 'email')}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <FaEdit className="text-orange-500" />
                                        </motion.button>
                                    </div>
                                    <AnimatePresence>
                                        {editMode === 'email' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="relative">
                                                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 text-xl" />
                                                    <MotionInput
                                                        type="email"
                                                        id="email"
                                                        value={profile.email || ''}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full focus:outline-orange-400 text-orange-900 bg-orange-600/20 rounded-md border-orange-300 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 pl-12 pr-4 py-3 text-lg"
                                                        whileFocus={{ scale: 1.02 }}
                                                        autoFocus
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <motion.button
                                    type="button"
                                    onClick={handleDeleteAccount}
                                    className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-300 flex items-center justify-center text-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaTrash className="mr-2" />
                                    Delete Account
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate={activeTab === "health" ? "visible" : "hidden"}
                >
                    {activeTab === "health" && (
                        <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-4 mb-6">
                                <GiPerson className="text-orange-500 text-3xl" />
                                <h3 className="text-2xl font-semibold text-orange-600">Health Information</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-orange-700 font-medium mb-2">Age:</label>
                                    <MotionInput
                                        type="number"
                                        id="age"
                                        value={profile.age}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-orange-700 font-medium mb-2">Weight (kg):</label>
                                    <MotionInput
                                        type="number"
                                        id="weight"
                                        value={profile.weight}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-orange-700 font-medium mb-2">Height (cm):</label>
                                    <MotionInput
                                        type="number"
                                        id="height"
                                        value={profile.height}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>
                                <div>
                                    <MotionSelect
                                        options={[
                                            { value: 'male', label: 'Male' },
                                            { value: 'female', label: 'Female' },
                                            { value: 'other', label: 'Other' }
                                        ]}
                                        selectedOption={{ value: profile.gender, label: profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) }}
                                        onSelect={(option) => setProfile({ ...profile, gender: option.value as 'male' | 'female' | 'other' })}
                                        label="Gender"
                                    />
                                </div>
                                <div>
                                    <MotionSelect
                                        options={[
                                            { value: 'sedentary', label: 'Sedentary' },
                                            { value: 'light', label: 'Light' },
                                            { value: 'moderate', label: 'Moderate' },
                                            { value: 'active', label: 'Active' },
                                            { value: 'very active', label: 'Very Active' }
                                        ]}
                                        selectedOption={{ value: profile.activityLevel, label: profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1) }}
                                        onSelect={(option) => setProfile({ ...profile, activityLevel: option.value as 'sedentary' | 'light' | 'moderate' | 'active' | 'very active' })}
                                        label="Activity Level"
                                    />
                                </div>
                                <div>
                                    <label className="block text-orange-700 font-medium mb-2">Health Conditions:</label>
                                    <MotionInput
                                        type="text"
                                        id="healthConditions"
                                        value={profile.healthConditions.join(', ')}
                                        onChange={(e) => setProfile({...profile, healthConditions: e.target.value.split(', ')})}
                                        className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                        placeholder="Enter conditions separated by commas"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate={activeTab === "fasting" ? "visible" : "hidden"}
                >
                    {activeTab === "fasting" && (
                        <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-4 mb-6">
                                <GiSandsOfTime className="text-orange-500 text-3xl" />
                                <h3 className="text-2xl font-semibold text-orange-600">Fasting Preferences</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                <MotionSelect
                                    options={fastingTypes.map(type => ({ value: type.name, label: `${type.icon} ${type.name}` }))}
                                    selectedOption={{ value: selectedFastingType.name, label: `${selectedFastingType.icon} ${selectedFastingType.name}` }}
                                    onSelect={handleFastingTypeChange}
                                    label="Preferred Fasting Method"
                                />
                                </div>
                                {profile.preferredMethod === "custom" && (
                                    <motion.div 
                                        className="grid grid-cols-2 gap-4"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div>
                                            <label className="block text-orange-700 font-medium mb-2">Custom Fast Start:</label>
                                            <motion.input
                                                type="time"
                                                id="start"
                                                value={profile.customFastingWindow?.start || ''}
                                                onChange={handleCustomFastingWindowChange}
                                                className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                                whileFocus={{ scale: 1.02 }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-orange-700 font-medium mb-2">Custom Fast End:</label>
                                            <motion.input
                                                type="time"
                                                id="end"
                                                value={profile.customFastingWindow?.end || ''}
                                                onChange={handleCustomFastingWindowChange}
                                                className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                                whileFocus={{ scale: 1.02 }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate={activeTab === "tracking" ? "visible" : "hidden"}
                    className="bg-orange-50 p-6 rounded-lg shadow-lg"
                >
                    {activeTab === "tracking" && (
                        <>
                            <div className="flex items-center space-x-4 mb-6">
                                <GiChart className="text-orange-500 text-3xl" />
                                <h3 className="text-2xl font-semibold text-orange-600">Tracking & Reminders</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block mb-2">
                                        <div className="flex items-center space-x-2 text-orange-700 font-medium">
                                            <FaBell className="text-orange-500" />
                                            <span>Reminder Frequency (hours):</span>
                                        </div>
                                    </label>
                                    <motion.input
                                        type="range"
                                        id="reminderFrequency"
                                        min="1"
                                        max="24"
                                        value={profile.reminderFrequency || '4'}
                                        onChange={handleInputChange}
                                        className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                                        whileFocus={{ scale: 1.02 }}
                                    />
                                    <div className="flex justify-between text-sm text-orange-600 mt-1">
                                        <span>1h</span>
                                        <span className="font-bold">{profile.reminderFrequency || '4'}h</span>
                                        <span>24h</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <motion.input
                                        type="checkbox"
                                        id="hydrationReminders"
                                        checked={profile.hydrationReminders || false}
                                        onChange={handleInputChange}
                                        className="form-checkbox h-5 w-5 text-orange-500 rounded border-orange-300 focus:ring-orange-200"
                                        whileHover={{ scale: 1.1 }}
                                    />
                                    <label htmlFor="hydrationReminders" className="flex items-center space-x-2 text-orange-700 cursor-pointer">
                                        <GiWaterDrop className="text-blue-500" />
                                        <span>Enable Hydration Reminders</span>
                                    </label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <motion.input
                                        type="checkbox"
                                        id="stressMoodTracking"
                                        checked={profile.stressMoodTracking || false}
                                        onChange={handleInputChange}
                                        className="form-checkbox h-5 w-5 text-orange-500 rounded border-orange-300 focus:ring-orange-200"
                                        whileHover={{ scale: 1.1 }}
                                    />
                                    <label htmlFor="stressMoodTracking" className="flex items-center space-x-2 text-orange-700 cursor-pointer">
                                        <FaSmile className="text-yellow-500" />
                                        <span>Enable Stress & Mood Tracking</span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>

                <CommunitySection 
                    activeTab={activeTab}
                    profile={profile}
                    handleInputChange={handleInputChange}
                />

                <AdvancedSection 
                    activeTab={activeTab}
                    profile={profile}
                    handleInputChange={handleInputChange}
                />

                <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate={activeTab === "subscription" ? "visible" : "hidden"}
                >
                    {activeTab === "subscription" && (
                        <div className="bg-orange-50 p-6 rounded-lg shadow-lg">
                            <div className="flex items-center space-x-4 mb-6">
                                <GiPadlock className="text-orange-500 text-3xl" />
                                <h3 className="text-2xl font-semibold text-orange-600">Subscription</h3>
                            </div>
                            <div className="space-y-6">
                                <p className="text-orange-700 font-medium">Current Subscription Tier:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SubscriptionCard
                                        title="Free"
                                        price="$0/month"
                                        features={[
                                            "Basic fasting tracker",
                                            "Limited fasting types",
                                            "Basic analytics",
                                        ]}
                                        isSelected={profile.subscriptionTier === 'free' || !profile.subscriptionTier}
                                        onClick={() => setProfile({ ...profile, subscriptionTier: 'free' })}
                                    />
                                    <SubscriptionCard
                                        title="Premium"
                                        price="$4.99/month"
                                        features={[
                                            "Advanced fasting tracker",
                                            "All fasting types",
                                            "Detailed analytics",
                                            "AI-powered coaching",
                                            "Community access",
                                            "Priority support",
                                        ]}
                                        isSelected={profile.subscriptionTier === 'premium'}
                                        onClick={() => setProfile({ ...profile, subscriptionTier: 'premium' })}
                                    />
                                </div>
                                {profile.subscriptionTier === 'free' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="mt-6 bg-orange-100 p-4 rounded-lg"
                                    >
                                        <p className="text-orange-700 font-medium mb-2">Upgrade to Premium:</p>
                                        <ul className="list-disc list-inside text-orange-600 space-y-1">
                                            <li>Unlock all premium features</li>
                                            <li>Get personalized AI coaching</li>
                                            <li>Join our exclusive fasting community</li>
                                        </ul>
                                        <motion.button
                                            className="mt-4 w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition duration-300"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setProfile({ ...profile, subscriptionTier: 'premium' })}
                                        >
                                            Upgrade Now
                                        </motion.button>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                <motion.button
                    type="submit"
                    className="w-full text-lg flex items-center justify-center bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaUserEdit className="mr-3"/> Update Profile
                </motion.button>
            </form>
        </motion.div>
    );
}
