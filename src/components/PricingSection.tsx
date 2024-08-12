import React from 'react';
import { motion } from 'framer-motion';
import { GiPadlock, GiRocket } from 'react-icons/gi';
import { Zap, Users, Headphones, BarChart } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    features: string[];
    isPopular?: boolean;
    onSelectPlan: () => void;
}
  
const PricingCard: React.FC<PricingCardProps> = ({ title, price, features, isPopular = false, onSelectPlan }) => (
    
    <motion.div
        className={`relative bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-xl border border-purple-200 ${
        isPopular ? 'border-purple-400' : ''
        }`}
        whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
        {isPopular && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-tr-xl rounded-bl-xl">
            Most Popular
        </div>
        )}
        <h3 className="text-2xl font-bold text-purple-800 mb-4">{title}</h3>
        <p className="text-4xl font-extrabold text-purple-900 mb-6">{price}</p>
        <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
            <li key={index} className="flex items-center text-purple-700">
            <Zap className="w-5 h-5 mr-2 text-purple-500" />
            {feature}
            </li>
        ))}
        </ul>
        <motion.button
        className={`w-full py-3 rounded-lg text-white font-semibold ${
            isPopular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSelectPlan}
        >
        Coming Soon
        </motion.button>
    </motion.div>
    );

    const PricingComponent = () => {
    return (
        <section id="pricing" className="bg-purple-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-purple-900 sm:text-5xl">
                    Choose Your Fasting Journey
                </h2>
                <p className="mt-4 sm:text-xl text-purple-600">
                    Select the plan that best fits your health and wellness goals
                </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                <PricingCard
                    title="Basic"
                    price="Free"
                    features={[
                    "Basic fasting tracker",
                    "Limited fasting types",
                    "Basic analytics",
                    ]}
                    onSelectPlan={() => console.log("Basic plan selected")}
                />
                <PricingCard
                    title="Premium"
                    price="$4.99/mo"
                    features={[
                    "Advanced fasting tracker",
                    "All fasting types",
                    "Detailed analytics",
                    "AI-powered coaching",
                    "Community access",
                    "Priority support",
                    ]}
                    isPopular={true}
                    onSelectPlan={() => console.log("Premium plan selected")}
                />
                <PricingCard
                    title="Family"
                    price="$9.99/mo"
                    features={[
                    "All Premium features",
                    "Up to 5 family members",
                    "Shared progress tracking",
                    "Family challenges",
                    "Personalized meal plans",
                    ]}
                    onSelectPlan={() => console.log("Family plan selected")}
                />
                </div>
                <div className="mt-16 text-center">
                <h3 className="text-2xl font-bold text-purple-800 mb-6">Why Choose Our Premium Plans?</h3>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center">
                    <GiRocket className="text-5xl text-purple-600 mb-4" />
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Accelerated Progress</h4>
                    <p className="text-purple-600">Achieve your goals faster with advanced tracking and insights</p>
                    </div>
                    <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-purple-600 mb-4" />
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Community Support</h4>
                    <p className="text-purple-600">Connect with like-minded individuals on their fasting journey</p>
                    </div>
                    <div className="flex flex-col items-center">
                    <BarChart className="w-12 h-12 text-purple-600 mb-4" />
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">In-Depth Analytics</h4>
                    <p className="text-purple-600">Gain valuable insights into your fasting patterns and progress</p>
                    </div>
                    <div className="flex flex-col items-center">
                    <Headphones className="w-12 h-12 text-purple-600 mb-4" />
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Priority Support</h4>
                    <p className="text-purple-600">Get expert help whenever you need it with our dedicated support team</p>
                    </div>
                    <div className="flex flex-col items-center">
                    <GiPadlock className="text-5xl text-purple-600 mb-4" />
                    <h4 className="text-lg font-semibold text-purple-800 mb-2">Data Security</h4>
                    <p className="text-purple-600">Your health data is encrypted and securely stored</p>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
};

export default PricingComponent;
