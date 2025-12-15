import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface GlassFormProps {
  onSubmit: (e: React.FormEvent) => void;
  title?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showButtons?: boolean;
  buttonAlignment?: 'left' | 'center' | 'right';
}

const GlassForm: React.FC<GlassFormProps> = ({
  onSubmit,
  title,
  children,
  submitText = 'Salvar',
  cancelText = 'Cancelar',
  onCancel,
  loading = false,
  disabled = false,
  className = '',
  showButtons = true,
  buttonAlignment = 'right'
}) => {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <GlassCard className={cn('p-6', className)}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-b border-white/10 pb-4"
          >
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </motion.div>
        )}

        {/* Form fields */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {children}
        </motion.div>

        {/* Buttons */}
        {showButtons && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'flex space-x-3 pt-4 border-t border-white/10',
              alignmentClasses[buttonAlignment]
            )}
          >
            {onCancel && (
              <GlassButton
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </GlassButton>
            )}
            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
              disabled={disabled}
            >
              {submitText}
            </GlassButton>
          </motion.div>
        )}
      </form>
    </GlassCard>
  );
};

export default GlassForm;