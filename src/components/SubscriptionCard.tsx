import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

interface SubscriptionCardProps {
    title: string;
    price: string;
    features: string[];
    isSelected: boolean;
    onClick: () => void;
}

export function SubscriptionCard({ title, price, features, isSelected, onClick }: SubscriptionCardProps) {
    return (
        <motion.div
            className={`border rounded-lg p-6 max-w-80 w-full ${
                isSelected ? 'border-orange-500 bg-orange-100' : 'border-orange-200'
            }`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <h4 className="text-xl font-bold text-orange-600 mb-2">{title}</h4>
            <p className="text-2xl font-bold text-orange-500 mb-4">{price}</p>
            <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center text-orange-700">
                        <FaCheck className="text-green-500 mr-2" />
                        {feature}
                    </li>
                ))}
            </ul>
            <motion.button
                className={`w-full py-2 px-4 rounded-full ${
                    isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                }`}
                onClick={onClick}
                whileTap={{ scale: 0.95 }}
            >
                {isSelected ? 'Current Plan' : 'Select Plan'}
            </motion.button>
        </motion.div>
    );
}
