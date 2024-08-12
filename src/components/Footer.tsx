import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
    const footerSections = [
        {
            title: 'Product',
            links: [
                { name: 'Features', to: 'features' },
                { name: 'Pricing', to: 'pricing' },
                { name: 'Quiz', to: 'quiz' },
                { name: 'Discover', to: 'discover' }
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', to: 'about' },
                { name: 'Other Free Tools', to: 'tools' },
            ]
        },
        {
            title: 'Resources',
            links: [
                { name: 'Blog', to: 'blog' },
                { name: 'Newsletter', to: 'newsletter' },
                { name: 'Events', to: 'events' },
                { name: 'Help Center', to: 'help' }
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Terms', to: '/termsofservice', isExternal: true },
                { name: 'Privacy', to: '/privacy', isExternal: true },
                { name: 'Cookies', to: 'cookies' },
            ]
        }
    ];

    const socialIcons = [
        { name: 'Facebook', icon: FaFacebook },
        { name: 'Twitter', icon: FaTwitter },
        { name: 'LinkedIn', icon: FaLinkedinIn },
        { name: 'GitHub', icon: FaGithub },
    ];

    return (
        <footer className="bg-indigo-100 text-indigo-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        {link.isExternal ? (
                                            <RouterLink
                                                to={link.to}
                                                className="hover:text-indigo-600 transition-colors duration-300 cursor-pointer"
                                            >
                                                {link.name}
                                            </RouterLink>
                                        ) : (
                                            <Link
                                                to={link.to}
                                                smooth={true}
                                                duration={500}
                                                className="hover:text-indigo-600 transition-colors duration-300 cursor-pointer"
                                            >
                                                {link.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-indigo-200 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold mb-2">Subscribe to our newsletter</h3>
                            <form className="flex">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-600 transition-colors duration-300"
                                >
                                    Subscribe
                                </motion.button>
                            </form>
                        </div>
                        <div className="flex space-x-4">
                            {socialIcons.map((social) => (
                                <a
                                    key={social.name}
                                    href="#"
                                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300"
                                >
                                    <span className="sr-only">{social.name}</span>
                                    <social.icon className="w-6 h-6" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Belly Clock - Free Fasting Calculator. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
