import React from 'react';
import { motion } from 'motion/react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  hoverEffect?: boolean;
  animateEntrance?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  animateEntrance = true,
  delay = 0,
  id,
  ...props
}) => {
  const cardStyle = `
    bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8
    ${hoverEffect ? 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-slate-250 transition-all duration-300' : ''}
    ${className}
  `;

  if (animateEntrance) {
    return (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
        className={cardStyle}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div id={id} className={cardStyle} {...props}>
      {children}
    </div>
  );
};
