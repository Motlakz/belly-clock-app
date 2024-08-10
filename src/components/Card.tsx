import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CardProps {
    title: string;
    description: string;
    link: string;
    imageUrl: string;
    gradient: string;
}

const Card: React.FC<CardProps> = ({ title, description, link, imageUrl, gradient }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)" }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`relative block p-6 ${gradient} bg-opacity-30 backdrop-blur-md rounded-3xl shadow-lg border border-white border-opacity-30 overflow-hidden`}
        >
            <Link to={link} target="_blank" className="block">
                <img src={imageUrl} alt={title} className="w-full h-full max-h-80 object-cover rounded-3xl mb-4" />
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h2>
                <p className="mt-2 text-white drop-shadow-lg">{description}</p>
            </Link>
        </motion.div>
    );
};

export default Card;
