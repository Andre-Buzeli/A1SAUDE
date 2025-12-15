import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  animate?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  className = '',
  onClick,
  children,
  animate = true
}) => {
  const baseClasses = 'backdrop-blur-[2px] border border-white/10 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.35)]';
  const variantClasses = {
    default: 'bg-white/[0.05]',
    elevated: 'bg-white/[0.06] shadow-[0_2px_10px_rgba(0,0,0,0.4)]',
    interactive: 'bg-white/[0.05] hover:bg-white/[0.08] transition-all cursor-pointer hover:scale-[1.02]'
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Component
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
