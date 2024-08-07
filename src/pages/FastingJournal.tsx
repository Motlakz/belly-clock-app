import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import EmojiPicker from '../components/EmojiPicker';
import { expressiveEmojis } from '../api/emojiData';
import { FaSmile } from 'react-icons/fa'; // Import the smile icon

const FastingJournal: React.FC = () => {
    const { user } = useUser();
    const [entry, setEntry] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [entries, setEntries] = useState<{ entry: string; isPublic: boolean; id: string; imageUrl?: string; emotion?: string }[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [alert, setAlert] = useState('');
    const [viewingEntry, setViewingEntry] = useState<{ entry: string; isPublic: boolean; id: string; imageUrl?: string; emotion?: string } | null>(null);
    const [editingEntry, setEditingEntry] = useState('');
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false); // State for emoji picker visibility
    const [isEmojiSelected, setIsEmojiSelected] = useState(false); // State for emoji selection status

    const fetchEntries = useCallback(async () => {
        if (!user) {
            console.error('No user logged in');
            return;
        }
    
        try {
            const q = query(collection(db, 'journalEntries'), where('userId', '==', user.id));
            const querySnapshot = await getDocs(q);
            const fetchedEntries: { entry: string; isPublic: boolean; id: string; imageUrl?: string; emotion?: string }[] = [];
            querySnapshot.forEach((doc) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fetchedEntries.push({ ...doc.data(), id: doc.id } as any);
            });
            setEntries(fetchedEntries);
        } catch (error) {
            console.error('Error fetching entries: ', error);
        }
    }, [user]);
    
    useEffect(() => {
        if (user) {
            fetchEntries();
        }
    }, [user, fetchEntries]);

    const handleEntryChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEntry(event.target.value);
        setIsEmojiSelected(false); // Reset emoji selection status when changing entry
    };

    const handleToggleChange = () => {
        setIsPublic(!isPublic);
        setAlert(`Entry set to ${!isPublic ? 'public' : 'private'}`);
        setTimeout(() => setAlert(''), 3000);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!user) {
            console.error('No user logged in');
            return;
        }

        try {
            let imageUrl = '';
            if (image) {
                const storageRef = ref(storage, `users/${user.id}/images/${image.name}`);
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            }

            const entryData = {
                entry,
                isPublic,
                emotion: selectedEmotion,
                imageUrl,
                userId: user.id,
                createdAt: new Date(),
            };

            if (editingId) {
                await updateDoc(doc(db, 'journalEntries', editingId), entryData);
                setEditingId(null);
            } else {
                await addDoc(collection(db, 'journalEntries'), entryData);
            }
            setEntry('');
            setIsPublic(false);
            setSelectedEmotion('');
            setImage(null);
            setIsEmojiSelected(false); // Reset emoji selection status after submission
            fetchEntries();
        } catch (error) {
            console.error('Error handling document: ', error);
        }
    };

    const handleEdit = (entryId: string) => {
        const entryToEdit = entries.find(e => e.id === entryId);
        if (entryToEdit) {
            setEditingEntry(entryToEdit.entry);
            setIsPublic(entryToEdit.isPublic);
            setEditingId(entryId);
            setSelectedEmotion(entryToEdit.emotion || '');
            setIsEmojiSelected(!!entryToEdit.emotion); // Set emoji selection status based on existing entry
        }
    };

    const handleDelete = async (entryId: string) => {
        try {
            await deleteDoc(doc(db, 'journalEntries', entryId));
            fetchEntries();
            setViewingEntry(null); // Close the popup
        } catch (error) {
            console.error('Error deleting document: ', error);
        }
    };

    const handleUpdateEntry = async () => {
        if (!editingId || !user) return;

        try {
            const entryData = {
                entry: editingEntry,
                isPublic,
                emotion: selectedEmotion,
                userId: user.id,
                updatedAt: new Date(),
            };

            await updateDoc(doc(db, 'journalEntries', editingId), entryData);
            setEditingId(null);
            setViewingEntry(null);
            fetchEntries();
        } catch (error) {
            console.error('Error updating document: ', error);
        }
    };

    const handleView = (entry: { entry: string; isPublic: boolean; id: string; imageUrl?: string; emotion?: string }) => {
        setViewingEntry(entry);
    };

    return (
        <div className="bg-orange-50 p-4 sm:p-8 min-h-screen rounded-lg">
            <section className="max-w-4xl mx-auto p-6 backdrop-blur-md bg-gradient-to-br from-orange-100 to-orange-200 border border-orange-300 rounded-lg shadow-lg">
                <motion.h2
                    className="text-3xl font-bold text-orange-600 mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Fasting Journal
                </motion.h2>
                <form onSubmit={handleSubmit} className="mb-6">
                    <motion.textarea
                        value={entry}
                        onChange={handleEntryChange}
                        placeholder="Write your fasting thoughts here..."
                        className="w-full h-40 p-4 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200 bg-white/50 backdrop-blur-md shadow-inner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <div className="flex items-center justify-between mt-2 relative">
                        <label className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isPublic}
                                    onChange={handleToggleChange}
                                    className="sr-only"
                                />
                                <div className="w-10 h-6 bg-orange-200 rounded-full shadow-inner"></div>
                                <div className={`dot absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ease-in-out ${isPublic ? 'transform translate-x-full bg-orange-500' : ''}`}></div>
                            </div>
                            <div className="ml-3 text-gray-700 font-medium">
                                {isPublic ? 'Public' : 'Private'}
                            </div>
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
                            className="p-2 gap-3 flex items-center border border-orange-300 rounded-md bg-white/50"
                        >
                            <FaSmile /> {isEmojiSelected ? 'Emoji Selected' : 'How are you feeling?'}
                        </button>
                        <EmojiPicker
                            emojis={expressiveEmojis}
                            selectedEmotion={selectedEmotion}
                            onSelect={(emoji) => {
                                setSelectedEmotion(emoji);
                                setIsEmojiSelected(true); // Set emoji selection status to true
                                setIsEmojiPickerVisible(false); // Close the picker after selection
                            }}
                            isVisible={isEmojiPickerVisible}
                            onClose={() => setIsEmojiPickerVisible(false)} // Close the picker
                        />
                    </div>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="mt-2"
                    />
                    <motion.button
                        type="submit"
                        className="mt-4 w-full p-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg hover:from-orange-500 hover:to-orange-700 transition duration-200 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {editingId ? 'Update' : 'Submit'}
                    </motion.button>
                </form>

                {alert && (
                    <div className="mb-4 p-2 bg-orange-100 text-orange-700 rounded">
                        {alert}
                    </div>
                )}

                <h3 className="text-lg font-semibold text-orange-600 mb-2">Journal Entries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map((entry) => (
                        <motion.div
                            key={entry.id}
                            className="p-4 border border-orange-200 rounded-lg shadow-md bg-white/50 backdrop-blur-md cursor-pointer"
                            onClick={() => handleView(entry)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-gray-800 truncate">{entry.entry}</p>
                            <div className="flex justify-between items-center mt-2">
                                <small className={`block ${entry.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                                    {entry.isPublic ? 'Public' : 'Private'}
                                </small>
                                <div>{entry.emotion}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {viewingEntry && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white p-6 rounded-lg max-w-2xl w-full"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                            >
                                <h3 className="text-xl font-bold mb-2">Journal Entry</h3>
                                {editingId ? (
                                    <textarea
                                        value={editingEntry}
                                        onChange={(e) => setEditingEntry(e.target.value)}
                                        className="w-full h-40 p-2 border rounded mb-4"
                                    />
                                ) : (
                                    <p className="mb-4">{viewingEntry.entry}</p>
                                )}
                                {viewingEntry.imageUrl && (
                                    <img src={viewingEntry.imageUrl} alt="Entry" className="mb-4 max-w-full h-auto" />
                                )}
                                <p className="mb-2">Emotion: {viewingEntry.emotion}</p>
                                <p className={viewingEntry.isPublic ? 'text-green-600' : 'text-red-600'}>
                                    {viewingEntry.isPublic ? 'Public' : 'Private'}
                                </p>
                                <div className="mt-4 flex justify-end">
                                    {editingId ? (
                                        <>
                                            <button
                                                onClick={handleUpdateEntry}
                                                className="mr-2 px-3 py-1 bg-green-400 text-white rounded hover:bg-green-500 transition duration-200"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="mr-2 px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-200"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEdit(viewingEntry.id)}
                                                className="mr-2 px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500 transition duration-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(viewingEntry.id)}
                                                className="mr-2 px-3 py-1 bg-red-400 text-white rounded hover:bg-red-500 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setViewingEntry(null);
                                            setEditingId(null);
                                        }}
                                        className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </div>
    );
};

export default FastingJournal;
