import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const GlassInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassInputProps>(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  multiline = false,
  rows = 3,
  required = false,
  disabled = false,
  className = ''
}, ref) => {
  const inputClasses = cn(
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
    'px-4 py-3 text-white placeholder-white/60',
    'focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50',
    'transition-all duration-200',
    error ? 'border-medical-red/50 focus:ring-medical-red/50' : '',
    icon ? 'pl-12' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  );

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label} {required && <span className="text-medical-red">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            rows={rows}
            required={required}
            disabled={disabled}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            type={type}
            className={inputClasses}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            required={required}
            disabled={disabled}
          />
        )}
      </div>
      {error && (
        <motion.p 
          className="text-sm text-medical-red"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;