import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginRequest, User, AuthTokens, Permission, UserProfile } from '@/types/auth';
import { authService } from '@/services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
};

// Action types
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: AuthTokens }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DEV_USER'; payload: { user: User } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_DEV_USER':
      return {
        ...state,
        user: action.payload.user,
        tokens: null,
        isAuthenticated: true,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens');
        const storedUser = localStorage.getItem('auth_user');
        const storedDevUser = localStorage.getItem('dev_user');

        if (storedTokens && storedUser) {
          const tokens = JSON.parse(storedTokens);
          const user = JSON.parse(storedUser);

          // Check if token is still valid
          if (tokens.accessToken && new Date().getTime() < tokens.expiresIn) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
          } else {
            // Try to refresh token
            try {
              const newTokens = await authService.refreshToken(tokens.refreshToken);
              dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: newTokens });
              localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
            } catch (error) {
              // Refresh failed, logout
              localStorage.removeItem('auth_tokens');
              localStorage.removeItem('auth_user');
              dispatch({ type: 'LOGOUT' });
            }
          }
        } else if (storedDevUser) {
          const devUser: User = JSON.parse(storedDevUser);
          dispatch({ type: 'SET_DEV_USER', payload: { user: devUser } });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await authService.login(credentials);

      // Store in localStorage
      localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
      localStorage.setItem('auth_user', JSON.stringify(response.user));

      dispatch({ type: 'LOGIN_SUCCESS', payload: response });

      // Return dashboard path for redirect
      return getDashboardPath();
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (state.tokens?.refreshToken) {
        await authService.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    if (!state.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const newTokens = await authService.refreshToken(state.tokens.refreshToken);
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: newTokens });
    } catch (error) {
      // Refresh failed, logout
      logout();
      throw error;
    }
  };

  // Permission checking functions
  const hasPermission = (permission: Permission): boolean => {
    return state.user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Helper para obter dashboard correto baseado no perfil/estabelecimento
  const getDashboardPath = (): string => {
    if (!state.user) return '/login';

    // Perfis administrativos
    const adminProfiles: UserProfile[] = [
      'gestor_geral',
      'diretor_local',
      'gestor_local',
      'coordenador_geral',
      'coordenador_local',
      'supervisor',
      'secretario',
      'system_master'
    ];

    if (adminProfiles.includes(state.user.profile as UserProfile)) {
      return '/admin/dashboard';
    }

    // Perfis clínicos baseados no estabelecimento
    switch (state.user.establishmentType) {
      case 'hospital':
        return '/hospital/dashboard';
      case 'ubs':
        return '/ubs/dashboard';
      case 'upa':
        return '/upa/dashboard';
      default:
        return '/';
    }
  };

  // Dev mode: set simulated user
  const setDevUser = (user: User) => {
    try {
      localStorage.setItem('dev_user', JSON.stringify(user));
      dispatch({ type: 'SET_DEV_USER', payload: { user } });
    } catch (error) {
      console.error('Erro ao definir usuário dev:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getDashboardPath,
    setDevUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
