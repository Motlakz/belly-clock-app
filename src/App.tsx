/* eslint-disable react-hooks/exhaustive-deps */
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
import LandingPage from "./pages/Home";
import Navigation from './components/Navigation';
import { useUser } from "@clerk/clerk-react";
import SignUpPage from "./sign-up/[[...index]]";
import SignInPage from "./sign-in/[[...index]]";
import LoadingScreen from "./components/LoadingScreen";
import Modal from "./components/StressModal";
import StressChecker from "./components/StressChecker";

interface ProgressData {
    date: string;
    fastingHours: number;
}

export default function App() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [progressData, setProgressData] = useState<ProgressData[]>([]);
    const [isAppReady, setIsAppReady] = useState(false);
    const [isStressCheckerOpen, setIsStressCheckerOpen] = useState(false);

    const openStressChecker = () => {
        setIsStressCheckerOpen(true);
    };

    const closeStressChecker = () => {
        setIsStressCheckerOpen(false);
    };

    useEffect(() => {
        if (isLoaded) {
            // Simulate any necessary app initialization
            const timer = setTimeout(() => {
                setIsAppReady(true);
            }, 1000); // Adjust this time as needed
            return () => clearTimeout(timer);
        }
    }, [isLoaded]);

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

        console.log(`Fasting session ended with method: ${method}`);

        const newSession: ProgressData = {
            date: new Date().toISOString().split('T')[0],
            fastingHours: duration / 3600,
        };

        setProgressData(prevData => [...prevData, newSession]);

        try {
            await addDoc(collection(db, `users/${user.id}/progress`), newSession);
        } catch (error) {
            console.error('Error updating progress data:', error);
        }

        await fetchProgressData();
    };

    if (!isLoaded || !isAppReady) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <Navigation openStressChecker={openStressChecker} />
            <Modal isOpen={isStressCheckerOpen} onClose={closeStressChecker}>
                <StressChecker />
            </Modal>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        isSignedIn ? (
                            <Navigate to="/dashboard" />
                        ) : isAppReady ? (
                            <LoadingScreen />
                        ) : (
                            <LandingPage />
                        )
                    } 
                />

                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/sign-in" element={<SignInPage />} />

                <Route 
                    path="/dashboard" 
                    element={isSignedIn ? <DashboardPage progressData={progressData} onFastingSessionEnd={handleFastingSessionEnd} /> : <Navigate to="/" />} 
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
