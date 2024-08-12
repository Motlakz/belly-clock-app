/* eslint-disable react-hooks/exhaustive-deps */
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { useUser } from "@clerk/clerk-react";
import { db } from './firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Modal from "./components/StressModal";
import StressChecker from "./components/StressChecker";
import DashboardPage from "./pages/Dashboard";
import Loader from "./components/Loader";

const ProfileForm = lazy(() => import("./pages/ProfileForm"));
const HydrationReminder = lazy(() => import("./pages/HydrationReminder"));
const ProgressTracker = lazy(() => import("./pages/ProgressTracker"));
const FastingTimer = lazy(() => import("./pages/FastingTimer"));
const FastingJournal = lazy(() => import("./pages/FastingJournal"));
const LandingPage = lazy(() => import("./pages/Home"));
const SignUpPage = lazy(() => import("./sign-up/[[...index]]"));
const SignInPage = lazy(() => import("./sign-in/[[...index]]"));
const Navigation = lazy(() => import('./components/Navigation'));

interface ProgressData {
    date: string;
    fastingHours: number;
}

export default function App() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [progressData, setProgressData] = useState<ProgressData[]>([]);
    const [isAppReady, setIsAppReady] = useState(false);
    const [isStressCheckerOpen, setIsStressCheckerOpen] = useState(false);

    const openStressChecker = useCallback(() => {
        setIsStressCheckerOpen(true);
    }, []);

    const closeStressChecker = useCallback(() => {
        setIsStressCheckerOpen(false);
    }, []);

    useEffect(() => {
        if (isLoaded) {
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
    }, [isLoaded, user?.id]);

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

        try {
            await addDoc(collection(db, `users/${user.id}/progress`), newSession);
            setProgressData(prevData => [...prevData, newSession]);
        } catch (error) {
            console.error('Error updating progress data:', error);
        }
    };

    if (!isLoaded || !isAppReady) {
        return <Loader />;
    }

    return (
        <Router>
            <Suspense fallback={<Loader />}>

                <Navigation openStressChecker={openStressChecker} />
                <Modal isOpen={isStressCheckerOpen} onClose={closeStressChecker}>
                    <StressChecker />
                </Modal>
                <Routes>
                    <Route 
                        path="/" 
                        element={isSignedIn ? <Navigate to="/dashboard" /> : <LandingPage />} 
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
            </Suspense>
        </Router>
    );
}
