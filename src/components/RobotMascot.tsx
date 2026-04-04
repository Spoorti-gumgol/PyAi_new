import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RobotMascotProps {
  message: string;
  visible: boolean;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({ message, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none"
        >
          {/* Speech Bubble */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl rounded-br-none p-4 mb-4 shadow-lg max-w-[200px] relative">
            <p className="text-[#4B4B4B] font-bold text-sm leading-snug">{message}</p>
            {/* Tail */}
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 transform rotate-45"></div>
          </div>

          {/* Robot Image */}
          <div className="w-24 h-24 relative filter drop-shadow-xl">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1744451658473-cf5c564d5a37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcm9ib3QlMjBtYXNjb3QlMjBpbGx1c3RyYXRpb24lMjBtaW5pbWFsfGVufDF8fHx8MTc3MDk3OTc2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Robot Mascot"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
