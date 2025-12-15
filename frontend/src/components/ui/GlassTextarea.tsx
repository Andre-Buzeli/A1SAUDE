import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassTextareaProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  minLength?: number;
}

const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(({
  label,
  placeholder,
  value,
  onChange,
  error,
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  maxLength,
  minLength
}, ref) => {
  const textareaClasses = cn(
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
    'px-4 py-3 text-white placeholder-white/60',
    'focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50',
    'transition-all duration-200 resize-vertical',
    'min-h-[80px]',
    error ? 'border-medical-red/50 focus:ring-medical-red/50' : '',
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
        <textarea
          ref={ref}
          className={textareaClasses}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          rows={rows}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
        />
        {maxLength && value && (
          <div className="absolute bottom-2 right-2 text-xs text-text-secondary">
            {value.length}/{maxLength}
          </div>
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

GlassTextarea.displayName = 'GlassTextarea';

export default GlassTextarea;
