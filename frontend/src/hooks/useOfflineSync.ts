/**
 * Hook para Sincronização Offline
 * Sistema A1 Saúde
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: Record<string, unknown>;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timestamp: number;
  retries: number;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingOperations: PendingOperation[];
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>) => void;
  syncNow: () => Promise<void>;
  clearPending: () => void;
}

const DB_NAME = 'a1-saude-offline';
const STORE_NAME = 'pending-operations';
const DB_VERSION = 1;

// Abrir IndexedDB
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Operações no IndexedDB
const getAllPending = async (): Promise<PendingOperation[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
};

const addPending = async (operation: PendingOperation): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(operation);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const removePending = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const updatePending = async (operation: PendingOperation): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(operation);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const clearAllPending = async (): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

  // Carregar operações pendentes do IndexedDB
  const loadPendingOperations = useCallback(async () => {
    try {
      const pending = await getAllPending();
      setPendingOperations(pending.sort((a, b) => a.timestamp - b.timestamp));
    } catch (error) {
      console.error('[Offline] Erro ao carregar operações pendentes:', error);
    }
  }, []);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada!');
      // Auto-sync quando voltar online
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Você está offline. Os dados serão sincronizados quando a conexão for restaurada.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carregar operações pendentes ao montar
    loadPendingOperations();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingOperations]);

  // Adicionar operação pendente
  const addPendingOperation = useCallback(
    async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>) => {
      const newOperation: PendingOperation = {
        ...operation,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retries: 0
      };

      try {
        await addPending(newOperation);
        setPendingOperations(prev => [...prev, newOperation]);
        
        if (!isOnline) {
          toast.success('Operação salva localmente. Será sincronizada quando online.');
        }
      } catch (error) {
        console.error('[Offline] Erro ao salvar operação:', error);
        toast.error('Erro ao salvar operação offline');
      }
    },
    [isOnline]
  );

  // Sincronizar operações pendentes
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    const pending = await getAllPending();

    if (pending.length === 0) {
      setIsSyncing(false);
      return;
    }

    toast.loading(`Sincronizando ${pending.length} operações...`, { id: 'sync' });

    let successCount = 0;
    let failCount = 0;

    for (const operation of pending) {
      try {
        const response = await fetch(operation.endpoint, {
          method: operation.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
          },
          body: operation.method !== 'DELETE' ? JSON.stringify(operation.data) : undefined
        });

        if (response.ok) {
          await removePending(operation.id);
          successCount++;
        } else if (response.status >= 400 && response.status < 500) {
          // Erro do cliente - não tentar novamente
          await removePending(operation.id);
          failCount++;
        } else {
          // Erro do servidor - tentar novamente depois
          if (operation.retries < 3) {
            await updatePending({ ...operation, retries: operation.retries + 1 });
          } else {
            await removePending(operation.id);
            failCount++;
          }
        }
      } catch (error) {
        console.error('[Offline] Erro na sincronização:', error);
        if (operation.retries < 3) {
          await updatePending({ ...operation, retries: operation.retries + 1 });
        } else {
          await removePending(operation.id);
          failCount++;
        }
      }
    }

    await loadPendingOperations();
    setIsSyncing(false);

    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount} operações sincronizadas!`, { id: 'sync' });
    } else if (failCount > 0) {
      toast.error(`Sincronizado: ${successCount} | Falhas: ${failCount}`, { id: 'sync' });
    } else {
      toast.dismiss('sync');
    }
  }, [isOnline, isSyncing, loadPendingOperations]);

  // Limpar operações pendentes
  const clearPending = useCallback(async () => {
    try {
      await clearAllPending();
      setPendingOperations([]);
      toast.success('Operações pendentes removidas');
    } catch (error) {
      console.error('[Offline] Erro ao limpar operações:', error);
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount: pendingOperations.length,
    pendingOperations,
    addPendingOperation,
    syncNow,
    clearPending
  };
};

export default useOfflineSync;






