/* eslint-disable react-hooks/exhaustive-deps */
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import { ProfileForm } from "./pages/ProfileForm";
import HydrationReminder from "./pages/HydrationReminder";
import ProgressTracker from "./pages/ProgressTracker";
import FastingTimer from "./pages/FastingTimer";
import { useEffect, useState } from "react";
import { db } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import FastingJournal from "./pages/FastingJournal";

interface ProgressData {
    date: string;
    fastingHours: number;
}

export default function App() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [progressData, setProgressData] = useState<ProgressData[]>([]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchProgressData();
        }
    }, [isLoaded, user]);

    const fetchProgressData = async () => {
        if (!user) return;

        try {
            const querySnapshot = await getDocs(collection(db, `users/${user.id}/progress`));
            const data: ProgressData[] = querySnapshot.docs.map(doc => doc.data() as ProgressData);
            setProgressData(data);
        } catch (error) {
            console.error('Error fetching progress data:', error);
        }
    };

    const handleFastingSessionEnd = async (duration: number, method: string) => {
        if (!user) return;

        console.log(`Fasting session ended with method: ${method}`); // Example usage

        const newSession: ProgressData = {
            date: new Date().toISOString().split('T')[0],
            fastingHours: duration / 3600,
        };

        // Immediately update the local state
        setProgressData(prevData => [...prevData, newSession]);

        // Update Firestore
        try {
            await addDoc(collection(db, `users/${user.id}/progress`), newSession);
        } catch (error) {
            console.error('Error updating progress data:', error);
        }

        // Optionally, refresh data from Firestore
        await fetchProgressData();
    };

    if (!isLoaded) {
        return <div>Loading...</div>; // You can customize this loading state
    }

    return (
        <Router>
            <header>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </header>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Redirect to dashboard */}
                <Route 
                    path="/dashboard" 
                    element={<DashboardPage progressData={progressData} onFastingSessionEnd={handleFastingSessionEnd} />} 
                />
                <Route 
                    path="/profile" 
                    element={isSignedIn ? <ProfileForm userId={user.id} /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/hydration" 
                    element={isSignedIn ? <HydrationReminder userId={user.id} /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/progress" 
                    element={isSignedIn ? <ProgressTracker data={progressData} /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/fasting" 
                    element={isSignedIn ? <FastingTimer userId={user.id} onFastingSessionEnd={handleFastingSessionEnd} /> : <Navigate to="/" />} 
                />
                <Route 
                    path="/journal" 
                    element={isSignedIn ? <FastingJournal /> : <Navigate to="/" />} 
                />
            </Routes>
        </Router>
    );
}
