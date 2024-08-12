import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { FastingHistory, generateFastingSuggestions, ProgressData, UserProfile } from '../lib/fastingSuggestions';
import { FastingType, fastingTypes } from '../lib/fastingMethods';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '@clerk/clerk-react';
import Card from '../components/Card';
import SuggestionsModal from '../components/SuggestionsModal';
import fastingImage from '../assets/fasting.png';
import hydrationImage from '../assets/hydration.png';
import progressImage from '../assets/progress.png';
import journalImage from '../assets/journal.png';
import AppScreenLoading from '../components/AppScreen';
import Loader from '../components/Loader';

interface DashboardPageProps {
    progressData: ProgressData[];
    onFastingSessionEnd: (duration: number, method: string) => Promise<void>;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ progressData }) => {
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
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
                
                const currentFastingType: FastingType = fastingTypes.find(type => type.name === userData.currentFastingType) || fastingTypes[0];
                
                // Assuming progressData is available in the component's props
                return generateFastingSuggestions(profile, history, currentFastingType, progressData);
            }
        }
        return [];
    }, [user, progressData]);

    const checkAndOpenModal = useCallback(async () => {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const lastShownTimes = userData.lastShownTimes || [];

            const now = Timestamp.now();
            const eightHoursAgo = Timestamp.fromMillis(now.toMillis() - 8 * 60 * 60 * 1000);

            // Filter out times older than 24 hours
            const recentTimes = lastShownTimes.filter((time: Timestamp) => 
                time.toMillis() > now.toMillis() - 24 * 60 * 60 * 1000
            );

            if (recentTimes.length < 3 && (!recentTimes.length || recentTimes[recentTimes.length - 1].toMillis() < eightHoursAgo.toMillis())) {
                setIsSuggestionsModalOpen(true);
                recentTimes.push(now);

                // Update the user document with the new lastShownTimes
                await setDoc(userDocRef, { lastShownTimes: recentTimes }, { merge: true });
            }
        } else {
            // If the user document doesn't exist, create it
            await setDoc(userDocRef, { lastShownTimes: [Timestamp.now()] });
            setIsSuggestionsModalOpen(true);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            checkAndOpenModal();
            const intervalId = setInterval(checkAndOpenModal, 60000);
            return () => clearInterval(intervalId);
        }
    }, [user, checkAndOpenModal]);

    return (
        <div className="sm:px-12 px-8 py-8 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 min-h-screen mt-16 sm:mt-20 rounded-t-xl">
            <article className="text-center text-gray-700">
                <h1 className="text-3xl font-bold mb-8 text-center text-slate-500">Your Fasting Dashboard</h1>
                <p className="text-lg mb-6">Pick any card below for your Quick Start.</p>
            </article>
            
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-8">
                <Suspense fallback={<div><AppScreenLoading /></div>}>
                    <div>
                        <Card
                            title="Fasting Timer"
                            description="Track your fasting sessions and manage your time effectively."
                            link="/fasting"
                            imageUrl={fastingImage}
                            gradient="bg-gradient-to-br from-cyan-400 to-teal-400"
                        />
                    </div>
                    
                    <div>
                        <Card
                            title="Hydration Reminder"
                            description="Stay hydrated with timely reminders."
                            link="/hydration"
                            imageUrl={hydrationImage}
                            gradient="bg-gradient-to-br from-blue-200 to-blue-400"
                        />
                    </div>
                    
                    <div>
                        <Card
                            title="Progress Tracker"
                            description="Monitor your fasting progress over time."
                            link="/progress"
                            imageUrl={progressImage}
                            gradient="bg-gradient-to-br from-purple-200 to-indigo-400"
                        />
                    </div>

                    <div>
                        <Card
                            title="Fasting Journal"
                            description="Write any thoughts and experiences you have throughout your journey."
                            link="/journal"
                            imageUrl={journalImage}
                            gradient="bg-gradient-to-br from-yellow-200 to-orange-400"
                        />
                    </div>
                </Suspense>
            </div>

            <Suspense fallback={<div><Loader /></div>}>
                <SuggestionsModal
                    isOpen={isSuggestionsModalOpen}
                    onClose={() => setIsSuggestionsModalOpen(false)}
                    generateSuggestions={generateSuggestions}
                    progressData={progressData}
                />
            </Suspense>
        </div>
    );
};

export default DashboardPage;
