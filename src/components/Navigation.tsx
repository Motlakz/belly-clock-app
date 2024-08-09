import { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Link } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from "../assets/BellyClockLogo.jpeg"
import { FaBars, FaWindowClose } from 'react-icons/fa';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = ['Features', 'Pricing', 'Showcase', 'Discover'];

    return (
        <nav className="fixed top-0 left-0 z-20 w-full bg-indigo-100/50 backdrop-filter backdrop-blur-lg shadow-lg rounded-b-xl">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="text-2xl font-bold text-indigo-700"><a href="/"><img src={Logo} className="max-w-12 rounded-lg w-full object-cover" alt="Logo for fasting calculator" /></a></div>
                
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-6">
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
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-indigo-400 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300"
                        >
                            <UserButton />
                        </motion.div>
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
                        <div className="p-4 bg-indigo-300">
                            <button
                                className="text-indigo-700 focus:outline-none mb-4"
                                onClick={toggleMenu}
                            >
                                <FaWindowClose size={24} />
                            </button>
                            <div className="flex flex-col space-y-4">
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
                                <SignedOut>
                                    <button className="w-full bg-indigo-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300">
                                        <a href="/sign-in">Sign In</a>
                                    </button>
                                    <button className="w-full bg-purple-500 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-purple-600 transition-colors duration-300">
                                        <a href="/sign-up">Sign Up</a>
                                    </button>
                                </SignedOut>
                                <SignedIn>
                                    <div className="bg-indigo-400 bg-opacity-80 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-500 transition-colors duration-300">
                                        <UserButton />
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
