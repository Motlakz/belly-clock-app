import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWater, FaBell, FaExclamationCircle } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';

interface Notification {
    id: string;
    type: 'hydration' | 'reminder' | 'alert';
    message: string;
    timestamp: Timestamp;
}

interface NotificationsProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ userId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        const notificationsRef = collection(db, 'users', userId, 'notifications');
        const q = query(notificationsRef);

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notifs: Notification[] = [];
            querySnapshot.forEach((doc) => {
                notifs.push({ id: doc.id, ...doc.data() } as Notification);
            });
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [userId, isOpen]);

    const removeNotification = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'users', userId, 'notifications', id));
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'hydration':
                return <FaWater className="text-blue-500" />;
            case 'reminder':
                return <FaBell className="text-yellow-500" />;
            case 'alert':
                return <FaExclamationCircle className="text-red-500" />;
            default:
                return null;
        }
    };

    const formatTimestamp = (timestamp: Timestamp) => {
        const now = new Date();
        const notifDate = timestamp.toDate();
        const diff = now.getTime() - notifDate.getTime();
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return `${Math.floor(diff / 86400000)} days ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50"
                >
                    <header className="bg-indigo-100 p-4 flex items-center justify-between">
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <FaTimes />
                        </button>
                        <h3 className="text-lg font-semibold text-indigo-800">Notifications</h3> 
                    </header>
                    <div className="max-h-96 overflow-y-auto">
                        <AnimatePresence>
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="p-4 border-b border-gray-200 flex items-start"
                                >
                                    <div className="mr-3 mt-1">{getIcon(notification.type)}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-800">{notification.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatTimestamp(notification.timestamp)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => removeNotification(notification.id)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notifications;
