import { useState } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Link } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../assets/BellyClockLogo.jpeg"
import { FaBars, FaBell, FaUserAlt, FaUserCircle, FaWindowClose } from 'react-icons/fa';
import { GiBrain } from 'react-icons/gi';
import Notifications from './Notifications';

interface NavigationProps {
    openStressChecker: () => void;
}
  
const Navigation: React.FC<NavigationProps> = ({ openStressChecker }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const { user } = useUser();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);


    const menuItems = ['Features', 'Pricing', 'Quiz', 'Discover'];

    const signedInLinks = [
        { name: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="fixed top-0 left-0 z-20 w-full bg-indigo-100/50 backdrop-filter backdrop-blur-lg shadow-lg rounded-b-xl">
            <div className="container mx-auto flex items-center justify-between p-2">
                <div className="text-2xl font-bold text-indigo-700"><a href="/"><img src={Logo} className="rounded-lg object-cover"  width="48px" height="40px" alt="Logo for fasting calculator" /></a></div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
                    <SignedOut>
                        {menuItems.map((item) => (
                            <Link
                                key={item}
                                to={item.toLowerCase()}
                                smooth={true}
                                duration={500}
                                className="text-lg font-semibold text-indigo-700 hover:text-indigo-800 hover:underline-offset-2 hover:underline rounded cursor-pointer transition-colors duration-300"
                            >
                                {item}
                            </Link>
                        ))}
                    </SignedOut>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-indigo-700 focus:outline-none"
                    onClick={toggleMenu}
                >
                    <FaBars size={24} />
                </button>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                    <SignedOut>
                        <div className="flex space-x-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-indigo-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300"
                            >
                                <a href="/sign-in">Sign In</a>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-purple-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300"
                            >
                                <a href="/sign-up">Sign Up</a>
                            </motion.button>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex items-center space-x-4">
                            {signedInLinks.map((link) => (
                                <motion.a
                                    key={link.name}
                                    href={link.path}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex gap-2 items-center bg-indigo-400 bg-opacity-80 text-white p-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300"
                                >
                                    <FaUserCircle />
                                    {link.name}
                                </motion.a>
                            ))}
                            <div className="relative">
                                <motion.button
                                    onClick={toggleNotifications}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-indigo-400 flex items-center gap-2 bg-opacity-80 text-white p-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300"
                                >
                                    <FaBell size={16} /> Notifications
                                    {notificationCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {notificationCount}
                                        </span>
                                    )}
                                </motion.button>
                                {isNotificationsOpen && user && (
                                    <Notifications
                                        userId={user.id}
                                        isOpen={isNotificationsOpen}
                                        onClose={toggleNotifications}
                                        onNotificationCountChange={setNotificationCount}
                                    />
                                )}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-green-500 bg-opacity-80 flex items-center gap-2 text-white p-2 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
                                onClick={openStressChecker}
                            >
                                <GiBrain /> Stress Checker
                            </motion.button>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-indigo-400 bg-opacity-80 text-white px-2 py-0 pt-1 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300"
                            >
                                <UserButton />
                            </motion.div>
                        </div>
                    </SignedIn>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-64 shadow-lg md:hidden"
                    >
                        <div className="p-4 bg-indigo-300 rounded-bl-2xl">
                            <button
                                className="text-indigo-700 focus:outline-none mb-4"
                                onClick={toggleMenu}
                            >
                                <FaWindowClose size={24} />
                            </button>
                            <div className="flex flex-col space-y-4">
                                <SignedOut>
                                    {menuItems.map((item) => (
                                        <Link
                                            key={item}
                                            to={item.toLowerCase()}
                                            smooth={true}
                                            duration={500}
                                            className="text-lg font-semibold text-indigo-700 hover:text-indigo-800 hover:underline-offset-2 hover:underline rounded cursor-pointer transition-colors duration-300"
                                            onClick={toggleMenu}
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                    <button className="w-full bg-indigo-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300">
                                        <a href="/sign-in">Sign In</a>
                                    </button>
                                    <button className="w-full bg-purple-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300">
                                        <a href="/sign-up">Sign Up</a>
                                    </button>
                                </SignedOut>
                                <SignedIn>
                                    {signedInLinks.map((link) => (
                                        <a
                                            key={link.name}
                                            href={link.path}
                                            className="w-full flex gap-2 items-center justify-center bg-indigo-400 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300 text-center"
                                            onClick={toggleMenu}
                                        >
                                            <FaUserAlt />
                                            {link.name}
                                        </a>
                                    ))}
                                    <div className="relative">
                                        <motion.button
                                            onClick={toggleNotifications}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="bg-indigo-400 w-full justify-center flex items-center gap-2 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300"
                                        >
                                            <FaBell size={16} /> Notifications
                                        </motion.button>
                                        {isNotificationsOpen && user && (
                                            <Notifications
                                                userId={user.id}
                                                isOpen={isNotificationsOpen}
                                                onClose={toggleNotifications}
                                                onNotificationCountChange={setNotificationCount}
                                            />
                                        )}
                                    </div>
                                    <button
                                        className="w-full flex gap-2 justify-center items-center bg-green-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
                                        onClick={() => {
                                            openStressChecker();
                                            toggleMenu();
                                        }}
                                    >
                                       <GiBrain/> Stress Checker
                                    </button>
                                    <div className="flex justify-center items-center gap-2 bg-indigo-400 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300">
                                        <UserButton />
                                        Settings
                                    </div>
                                </SignedIn>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navigation;
