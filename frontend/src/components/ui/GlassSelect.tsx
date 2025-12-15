import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  options: Option[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const GlassSelect = forwardRef<HTMLDivElement, GlassSelectProps>(({
  label,
  placeholder = 'Selecione uma opção',
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = ''
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option: Option) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
  };

  const selectClasses = cn(
    'w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg',
    'px-4 py-3 text-white cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-medical-blue/50 focus:border-medical-blue/50',
    'transition-all duration-200',
    'flex items-center justify-between',
    error ? 'border-medical-red/50 focus:ring-medical-red/50' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  );

  return (
    <motion.div
      ref={ref}
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
      <div className="relative" ref={selectRef}>
        <div
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-white' : 'text-white/60'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-white/60 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-2 bg-white/15 backdrop-blur-xl border border-white/30 rounded-lg shadow-glass-xl max-h-60 overflow-y-auto"
            >
              {options.length === 0 ? (
                <div className="px-4 py-3 text-white/60 text-sm">
                  Nenhuma opção disponível
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      'px-4 py-3 cursor-pointer transition-colors duration-150',
                      'hover:bg-white/10',
                      option.disabled
                        ? 'text-white/40 cursor-not-allowed'
                        : 'text-white hover:text-white',
                      selectedOption?.value === option.value && 'bg-medical-blue/20 text-medical-blue'
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {selectedOption?.value === option.value && (
                        <Check className="w-4 h-4 text-medical-blue" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

GlassSelect.displayName = 'GlassSelect';

export default GlassSelect;
