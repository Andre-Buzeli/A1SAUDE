/**
 * Indicador de Status Offline
 * Sistema A1 Saúde
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CloudOff, Cloud } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import GlassButton from './GlassButton';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();

  return (
    <AnimatePresence>
      {/* Banner de Offline */}
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4"
        >
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              Você está offline. Os dados serão sincronizados automaticamente quando a conexão for restaurada.
            </span>
            {pendingCount > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Indicador de sincronização */}
      {isSyncing && isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4"
        >
          <div className="container mx-auto flex items-center justify-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">
              Sincronizando dados...
            </span>
          </div>
        </motion.div>
      )}

      {/* Badge flutuante com status */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <div
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-full shadow-lg backdrop-blur-md
            ${isOnline 
              ? pendingCount > 0 
                ? 'bg-yellow-500/20 border border-yellow-500/50' 
                : 'bg-green-500/20 border border-green-500/50'
              : 'bg-red-500/20 border border-red-500/50'
            }
          `}
        >
          {isOnline ? (
            pendingCount > 0 ? (
              <>
                <CloudOff className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm">{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={syncNow}
                  className="!p-1"
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-4 h-4 text-yellow-300 ${isSyncing ? 'animate-spin' : ''}`} />
                </GlassButton>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Sincronizado</span>
              </>
            )
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">Offline</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;






