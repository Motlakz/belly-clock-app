import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import { fastingPrompts } from '../lib/fastingPrompts';
import * as THREE from "three";
import { motion } from 'framer-motion';

const WheelSegment: React.FC<{ color: string; position: [number, number, number]; rotation: [number, number, number] }> = ({ color, position, rotation }) => {
    return (
        <Box args={[1, 0.2, 0.1]} position={position} rotation={rotation}>
            <meshStandardMaterial color={color} />
        </Box>
    );
};

const Wheel: React.FC<{ onSelectPrompt: (prompt: string) => void }> = ({ onSelectPrompt }) => {
    const wheelRef = useRef<THREE.Group>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(0);

    useFrame(() => {
        if (wheelRef.current && isSpinning) {
            wheelRef.current.rotation.z += spinSpeed;
            setSpinSpeed(speed => speed * 0.99);

            if (spinSpeed < 0.001) {
                setIsSpinning(false);
                const selectedIndex = Math.floor(Math.random() * fastingPrompts.length);
                onSelectPrompt(fastingPrompts[selectedIndex]);
            }
        }
    });

    const handleSpin = () => {
        setIsSpinning(true);
        setSpinSpeed(Math.random() * 0.5 + 0.5);
    };

    const segmentCount = 12;
    const segmentAngle = (Math.PI * 2) / segmentCount;

    return (
        <group ref={wheelRef}>
            {Array.from({ length: segmentCount }).map((_, index) => (
                <WheelSegment
                    key={index}
                    color={`hsl(${(index / segmentCount) * 360}, 70%, 50%)`}
                    position={[Math.cos(segmentAngle * index) * 2, Math.sin(segmentAngle * index) * 2, 0]}
                    rotation={[0, 0, segmentAngle * index]}
                />
            ))}
            <Text position={[0, 0, 0.1]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
                Spin!
            </Text>
            <Box args={[1, 1, 0.1]} position={[0, 0, 0]} onClick={handleSpin}>
                <meshStandardMaterial color="gray" opacity={0} transparent />
            </Box>
        </group>
    );
};

const FastingPromptWheel: React.FC = () => {
    const [selectedPrompt, setSelectedPrompt] = useState('');

    return (
        <div className="w-full max-w-4xl bg-white/20 rounded-xl p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <div className="aspect-square">
                        <Canvas camera={{ position: [0, 0, 5] }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Wheel onSelectPrompt={setSelectedPrompt} />
                        </Canvas>
                    </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-4">
                    <motion.div 
                        className="bg-white p-4 rounded-lg shadow-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h3 className="text-xl font-bold mb-2 text-orange-600">Your Fasting Prompt:</h3>
                        <p className="text-gray-700 min-h-[4rem]">
                            {selectedPrompt || "Spin the wheel to get a prompt!"}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FastingPromptWheel;
