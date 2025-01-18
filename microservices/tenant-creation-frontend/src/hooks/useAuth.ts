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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
          initialLoadComplete: true,
          error: null
        }));
        return;
      }

      try {
        // Get the ID token with claims
        const idTokenResult = await user.getIdTokenResult();
        console.log('ID token claims result:', idTokenResult.claims);
        const isAdmin = idTokenResult.claims.role === 'admin';

        if (!isAdmin) {
          // If not admin, sign out and set error
          await auth.signOut();
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            loading: false,
            initialLoadComplete: true,
            error: 'Access denied. Admin privileges required.'
          }));
          return;
        }

        // If admin, set authenticated state
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          loading: false,
          initialLoadComplete: true,
          error: null
        }));
      } catch (err) {
        console.error('Error checking admin status:', err);
        await auth.signOut();
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          loading: false,
          initialLoadComplete: true,
          error: 'Failed to verify admin privileges.'
        }));
      }
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
