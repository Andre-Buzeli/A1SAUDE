import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface GlassButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  children
}) => {
  const baseClasses = 'backdrop-blur-sm border rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary flex items-center justify-center gap-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm h-8',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12'
  };
  
  const variantClasses = {
    primary: 'bg-medical-blue/20 border-medical-blue/30 text-blue-100 hover:bg-medical-blue/30 focus:ring-medical-blue/50',
    secondary: 'bg-gray-500/20 border-gray-400/30 text-gray-100 hover:bg-gray-500/30 focus:ring-gray-400/50',
    ghost: 'bg-transparent border-white/20 text-white hover:bg-white/10 focus:ring-white/50',
    danger: 'bg-medical-red/20 border-medical-red/30 text-red-100 hover:bg-medical-red/30 focus:ring-medical-red/50'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105',
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
      type={type}
      whileHover={!isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isDisabled ? { scale: 0.95 } : {}}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default GlassButton;
