import React, { useState, useEffect, useCallback } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import EmojiPicker from '../components/EmojiPicker';
import { expressiveEmojis } from '../api/emojiData';
import { FaSmile, FaImage, FaLock, FaGlobeAmericas } from 'react-icons/fa';
import FastingPromptWheel from '../components/PromptGenerator';

interface JournalEntry {
  entry: string;
  isPublic: boolean;
  id: string;
  imageUrl?: string;
  emotion?: string;
  createdAt: Date;
}

const FastingJournal: React.FC = () => {
  const { user } = useUser();
  const [entry, setEntry] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [alert, setAlert] = useState('');
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState('');
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isEmojiSelected, setIsEmojiSelected] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      const q = query(collection(db, `users/${user.id}/journalEntries`), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedEntries: JournalEntry[] = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
      } as JournalEntry));
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
    setIsEmojiSelected(false);
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
        createdAt: new Date(),
      };

      if (editingId) {
        await updateDoc(doc(db, `users/${user.id}/journalEntries`, editingId), entryData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, `users/${user.id}/journalEntries`), entryData);
      }
      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Error handling document: ', error);
    }
  };

  const resetForm = () => {
    setEntry('');
    setIsPublic(false);
    setSelectedEmotion('');
    setImage(null);
    setIsEmojiSelected(false);
  };

  const handleEdit = (entryId: string) => {
    const entryToEdit = entries.find(e => e.id === entryId);
    if (entryToEdit) {
      setEditingEntry(entryToEdit.entry);
      setIsPublic(entryToEdit.isPublic);
      setEditingId(entryId);
      setSelectedEmotion(entryToEdit.emotion || '');
      setIsEmojiSelected(!!entryToEdit.emotion);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    try {
      await deleteDoc(doc(db, `users/${user.id}/journalEntries`, entryId));
      fetchEntries();
      setViewingEntry(null);
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
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, `users/${user.id}/journalEntries`, editingId), entryData);
      setEditingId(null);
      setViewingEntry(null);
      fetchEntries();
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  return (
    <div className="bg-orange-50 p-4 sm:p-8 min-h-screen">
      <section className="max-w-4xl mx-auto p-6 sm:my-20 my-16 bg-white rounded-lg shadow-lg">
        <motion.h2
          className="text-3xl font-bold text-orange-600 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Fasting Journal
        </motion.h2>

        <form onSubmit={handleSubmit} className="mb-8">
          <motion.textarea
            value={entry}
            onChange={handleEntryChange}
            placeholder="Write your fasting thoughts here..."
            className="w-full h-40 p-4 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition duration-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="flex flex-col gap-2 sm:flex-row items-center justify-between mt-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={handleToggleChange}
                  className="sr-only"
                />
                <div className="w-10 h-6 bg-orange-200 rounded-full shadow-inner"></div>
                <div 
                  className={`absolute left-0 top-0 w-6 h-6 bg-orange-500 rounded-full shadow transition-transform duration-300 ease-in-out transform ${
                    isPublic ? 'translate-x-full' : 'translate-x-0'
                  }`}
                ></div>
              </div>
              <div className="ml-3 text-gray-700 font-medium">
                {isPublic ? <FaGlobeAmericas className="inline mr-1" /> : <FaLock className="inline mr-1" />}
                {isPublic ? 'Public' : 'Private'}
              </div>
            </label>
            <button
              type="button"
              onClick={() => setIsEmojiPickerVisible(!isEmojiPickerVisible)}
              className="p-2 flex items-center border border-orange-300 rounded-md bg-white"
            >
              <FaSmile className="mr-2" /> {isEmojiSelected ? 'Emoji Selected' : 'How are you feeling?'}
            </button>
            <EmojiPicker
              emojis={expressiveEmojis}
              selectedEmotion={selectedEmotion}
              onSelect={(emoji) => {
                setSelectedEmotion(emoji);
                setIsEmojiSelected(true);
              }}
              isVisible={isEmojiPickerVisible}
              onClose={() => setIsEmojiPickerVisible(false)}
            />
          </div>
          <div className="my-4 flex items-center justify-center gap-4 sm:flex-row flex-col">
              <label htmlFor="image-upload" className="w-full justify-center cursor-pointer inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-md hover:bg-orange-200 transition duration-200">
                <FaImage className="mr-2" /> Upload Image
              </label>
              <input
                id="image-upload"
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
               <motion.button
                type="submit"
                className="w-full p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {editingId ? 'Update' : 'Submit'}
              </motion.button>
          </div>
        </form>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-orange-600 mb-4">Need inspiration? Spin the wheel!</h3>
          <FastingPromptWheel />
        </div>

        {alert && (
          <div className="mb-4 p-2 bg-orange-100 text-orange-700 rounded">
            {alert}
          </div>
        )}

        <h3 className="text-2xl font-semibold text-orange-600 mb-4">Journal Entries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              className="p-4 border border-orange-200 rounded-lg shadow-md bg-white cursor-pointer hover:shadow-lg transition duration-200"
              onClick={() => setViewingEntry(entry)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-gray-800 truncate">{entry.entry}</p>
              <div className="flex justify-between items-center mt-2">
                <small className={`${entry.isPublic ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.isPublic ? <FaGlobeAmericas className="inline mr-1" /> : <FaLock className="inline mr-1" />}
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
                <h3 className="text-2xl font-bold mb-4">Journal Entry</h3>
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
                  <img src={viewingEntry.imageUrl} alt="Entry" className="mb-4 max-w-full h-auto rounded-lg" />
                )}
                <p className="mb-2">Emotion: {viewingEntry.emotion}</p>
                <p className={viewingEntry.isPublic ? 'text-green-600' : 'text-red-600'}>
                  {viewingEntry.isPublic ? <FaGlobeAmericas className="inline mr-1" /> : <FaLock className="inline mr-1" />}
                  {viewingEntry.isPublic ? 'Public' : 'Private'}
                </p>
                <div className="mt-6 flex justify-end space-x-2">
                  {editingId ? (
                    <>
                      <button
                        onClick={handleUpdateEntry}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(viewingEntry.id)}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(viewingEntry.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
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
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition duration-200"
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
