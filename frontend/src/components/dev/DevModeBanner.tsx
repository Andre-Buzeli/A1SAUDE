import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevMode } from '@/hooks/useDevMode';

interface DevModeBannerProps {
  onClose?: () => void;
}

export const DevModeBanner: React.FC<DevModeBannerProps> = ({ onClose }) => {
  const { isDevMode } = useDevMode();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isDevMode || !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm border-b border-yellow-400/30 shadow-lg"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-900 animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">
                    🚧 MODO DESENVOLVIMENTO ATIVO
                  </p>
                  <p className="text-xs text-yellow-800">
                    Você está visualizando telas em desenvolvimento. Algumas funcionalidades podem não estar completas.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-yellow-400/30 transition-colors"
                aria-label="Fechar banner"
              >
                <X className="w-4 h-4 text-yellow-900" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

