import React from 'react';
import { cn } from '@/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value = 0, 
  max = 100, 
  className, 
  ...props 
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-blue-600 transition-all dark:bg-blue-500"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};