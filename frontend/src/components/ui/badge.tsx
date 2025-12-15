import React from 'react';
import { cn } from '@/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const badgeVariants = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  outline: 'border border-gray-200 text-gray-800 dark:border-gray-700 dark:text-gray-200',
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};