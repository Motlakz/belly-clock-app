import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import SuggestionsModal from '../components/SuggestionsModal';
import { FastingHistory, generateFastingSuggestions, UserProfile } from '../lib/fastingSuggestions';
import { fastingTypes } from '../lib/fastingMethods';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';

interface ProgressData {
    date: string;
    fastingHours: number;
}

interface DashboardPageProps {
    progressData: ProgressData[];
    onFastingSessionEnd: (duration: number, method: string) => Promise<void>;
}

const DashboardPage: React.FC<DashboardPageProps> = () => {
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(true);
    const { user } = useUser();

    const generateSuggestions = useCallback(async () => {
        if (user) {
            const docRef = doc(db, 'users', user.id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const profile: UserProfile = {
                    age: userData.age,
                    weight: userData.weight,
                    height: userData.height,
                    gender: userData.gender,
                    activityLevel: userData.activityLevel,
                    healthConditions: userData.healthConditions || [],
                };
                const history: FastingHistory = {
                    completedFasts: userData.completedFasts || 0,
                    averageFastDuration: userData.averageFastDuration || 0,
                    longestFast: userData.longestFast || 0,
                    consistency: userData.consistency || 0,
                };
                
                const currentFastingType = fastingTypes.find(type => type.name === userData.currentFastingType) || fastingTypes[0];
                
                return generateFastingSuggestions(profile, history, currentFastingType);
            }
        }
        return [];
    }, [user]);

    useEffect(() => {
        const checkAndOpenModal = async () => {
            const lastShownDate = localStorage.getItem('lastShownDate');
            const today = new Date().toISOString().split('T')[0];

            if (lastShownDate !== today) {
                setIsSuggestionsModalOpen(true);
                localStorage.setItem('lastShownDate', today);
            }
        };

        checkAndOpenModal();
    }, [user]);

    return (
        <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 min-h-screen">
            <article className="text-center text-gray-700">
                <h1 className="text-3xl font-bold mb-8 text-center text-slate-500">Your Fasting Dashboard</h1>
                <p className="text-lg mb-6">Pick any card below for your Quick Start.</p>
            </article>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card
                        title="Fasting Timer"
                        description="Track your fasting sessions and manage your time effectively."
                        link="/fasting"
                        imageUrl="/src/assets/fasting.png"
                        gradient="bg-gradient-to-br from-cyan-200 to-teal-400"
                    />
                </div>
                
                <div>
                    <Card
                        title="Hydration Reminder"
                        description="Stay hydrated with timely reminders."
                        link="/hydration"
                        imageUrl="/src/assets/hydration.png"
                        gradient="bg-gradient-to-br from-blue-200 to-blue-400"
                    />
                </div>
                
                <div>
                    <Card
                        title="Progress Tracker"
                        description="Monitor your fasting progress over time."
                        link="/progress"
                        imageUrl="/src/assets/progress.png"
                        gradient="bg-gradient-to-br from-purple-200 to-indigo-200"
                    />
                </div>

                <div>
                    <Card
                        title="Fasting Journal"
                        description="Write any thoughts and experiences you have throughout your journey."
                        link="/journal"
                        imageUrl="/src/assets/journal.png"
                        gradient="bg-gradient-to-br from-yellow-200 to-orange-400"
                    />
                </div>
            </div>

            <SuggestionsModal
                isOpen={isSuggestionsModalOpen}
                onClose={() => setIsSuggestionsModalOpen(false)}
                generateSuggestions={generateSuggestions}
            />
        </div>
    );
};

export default DashboardPage;
