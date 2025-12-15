import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para verificar se está em rota de desenvolvimento
 * Verifica se a rota começa com /dev (para rotas de desenvolvimento)
 */
export const useDevMode = () => {
  const location = useLocation();

  const isDevMode = useMemo(() => {
    // Verifica se está em rota de desenvolvimento
    return location.pathname.startsWith('/dev');
  }, [location.pathname]);

  return {
    isDevMode,
  };
};

