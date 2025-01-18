import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from '@firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialLoadComplete: boolean;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
    error: null,
    initialLoadComplete: false,
  });

  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      auth.tenantId = storedTenantId;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({
        ...prev,
        isAuthenticated: !!user,
        loading: false,
        initialLoadComplete: true,
      }));
    });

    return () => unsubscribe();
  }, []);

  const getCurrentUser = () => auth.currentUser;
  const getTenantId = () => auth.tenantId;

  const logout = () => {
    auth.signOut();
    setState({
      isAuthenticated: false,
      loading: false,
      error: null,
      initialLoadComplete: true,
    });
  };

  return {
    ...state,
    getCurrentUser,
    getTenantId,
    logout,
  };
};
