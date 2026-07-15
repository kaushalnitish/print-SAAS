import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const baseStyle = "relative flex items-center justify-center font-semibold rounded-2xl transition-colors duration-200 outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg h-14 px-6";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-850 active:bg-slate-950",
    secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-250",
    outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 border border-red-200"
  };

  return (
    <motion.button
      id={id}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
      className={`
        ${baseStyle}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
      ) : leftIcon ? (
        <span className="mr-3 flex items-center justify-center">{leftIcon}</span>
      ) : null}
      
      <span className="tracking-wide">{children}</span>
      
      {!isLoading && rightIcon && (
        <span className="ml-3 flex items-center justify-center">{rightIcon}</span>
      )}
    </motion.button>
  );
};
