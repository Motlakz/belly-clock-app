import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';

interface Option {
  value: string;
  label: string;
}

interface MotionSelectProps {
  options: Option[];
  selectedOption: Option;
  onSelect: (option: Option) => void;
  label: string;
}

const MotionSelect: React.FC<MotionSelectProps> = ({ options, selectedOption, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-orange-700 font-medium mb-2">{label}</label>
      <motion.div
        className="w-full p-2 rounded-md border-orange-300 bg-white shadow-sm focus:border-orange-400 focus:ring focus:ring-orange-200 focus:ring-opacity-50 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
      >
        <span>{selectedOption.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className="text-orange-500" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 bg-white border border-orange-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                className="p-2 cursor-pointer hover:bg-orange-100"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                whileHover={{ backgroundColor: '#FFF0E6' }}
              >
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MotionSelect;
