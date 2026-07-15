import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  statusMessage?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, statusMessage }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center text-sm">
        {label && <span className="font-semibold text-slate-500 text-lg">{label}</span>}
        <span className="font-bold text-slate-800 text-lg">{Math.round(progress)}%</span>
      </div>
      
      {/* Track */}
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
        {/* Animated Fill */}
        <motion.div
          className="h-full bg-slate-900 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </div>

      {statusMessage && (
        <motion.p
          key={statusMessage}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-medium text-slate-500 text-base italic mt-1.5"
        >
          {statusMessage}
        </motion.p>
      )}
    </div>
  );
};
