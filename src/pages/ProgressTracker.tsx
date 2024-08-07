import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ProgressData {
    date: string;
    fastingHours: number;
}

const ProgressTracker: React.FC<{ data: ProgressData[] }> = ({ data }) => {
    const validData = data.filter(item => !isNaN(item.fastingHours) && item.fastingHours > 0);

    const lineChartData = {
        labels: validData.map(item => item.date),
        datasets: [
            {
                label: 'Fasting Hours',
                data: validData.map(item => item.fastingHours),
                borderColor: 'rgb(99, 102, 241)', // Indigo-500
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.1,
                fill: true,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Fasting Progress Over Time',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 24,
            },
        },
    };

    const averageFastingHours = validData.length > 0
        ? validData.reduce((sum, item) => sum + item.fastingHours, 0) / validData.length
        : 0;

    const pieChartData = {
        labels: ['Fasting', 'Non-Fasting'],
        datasets: [
            {
                data: [averageFastingHours, Math.max(0, 24 - averageFastingHours)],
                backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(244, 114, 182, 0.8)'], // Indigo-500, Pink-400
                borderColor: ['rgb(99, 102, 241)', 'rgb(244, 114, 182)'],
                borderWidth: 1,
            },
        ],
    };

    const pieChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Average Daily Fasting Distribution',
            },
        },
    };

    const longestFast = validData.length > 0
        ? Math.max(...validData.map(item => item.fastingHours))
        : 0;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 p-4 rounded-lg">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white border-opacity-30"
            >
                <motion.h2 
                    className="text-3xl font-bold mb-6 text-center text-white"
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
                >
                    Progress Tracker
                </motion.h2>
                {validData.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div 
                                className="bg-white bg-opacity-20 p-4 rounded-lg shadow"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Line data={lineChartData} options={{
                                    ...lineChartOptions,
                                    plugins: {
                                        ...lineChartOptions.plugins,
                                        legend: {
                                            ...lineChartOptions.plugins.legend,
                                            labels: { color: 'rgba(255,255,255,0.8)' }
                                        },
                                        title: {
                                            ...lineChartOptions.plugins.title,
                                            color: 'rgba(255,255,255,0.9)'
                                        }
                                    },
                                    scales: {
                                        ...lineChartOptions.scales,
                                        x: { ticks: { color: 'rgba(255,255,255,0.7)' } },
                                        y: { ...lineChartOptions.scales.y, ticks: { color: 'rgba(255,255,255,0.7)' } }
                                    }
                                }} />
                            </motion.div>
                            <motion.div 
                                className="bg-white bg-opacity-20 p-4 rounded-lg shadow"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Pie data={pieChartData} options={{
                                    ...pieChartOptions,
                                    plugins: {
                                        ...pieChartOptions.plugins,
                                        legend: {
                                            ...pieChartOptions.plugins.legend,
                                            labels: { color: 'rgba(255,255,255,0.8)' }
                                        },
                                        title: {
                                            ...pieChartOptions.plugins.title,
                                            color: 'rgba(255,255,255,0.9)'
                                        }
                                    }
                                }} />
                            </motion.div>
                        </div>
                        <motion.div 
                            className="mt-6 bg-white bg-opacity-20 p-4 rounded-lg shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-xl font-semibold mb-2 text-white">Fasting Stats</h3>
                            <p className="text-lg text-white">
                                Average Fasting Hours: <span className="font-bold">{averageFastingHours.toFixed(2)}</span>
                            </p>
                            <p className="text-lg text-white">
                                Longest Fast: <span className="font-bold">{longestFast.toFixed(1)} hours</span>
                            </p>
                            <p className="text-lg text-white">
                                Total Fasts: <span className="font-bold">{validData.length}</span>
                            </p>
                        </motion.div>
                    </>
                ) : (
                    <motion.div 
                        className="bg-white bg-opacity-20 p-4 rounded-lg shadow text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-lg text-white">No fasting data available yet. Start your first fast to see your progress!</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ProgressTracker;
