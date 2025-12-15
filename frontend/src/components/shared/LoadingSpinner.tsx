/**
 * Componente de Loading Spinner
 * Sistema A1 Saúde - Gestão de Saúde Pública
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'Carregando...',
  fullScreen = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <motion.div
          className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Mensagem */}
        {message && (
          <motion.p
            className="text-gray-600 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;