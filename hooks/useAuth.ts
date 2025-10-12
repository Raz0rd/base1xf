'use client';

import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  loginAt: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está autenticado
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      const authenticated = localStorage.getItem('user_authenticated') === 'true';
      const termsAccepted = localStorage.getItem('terms_accepted') === 'true';
      const userDataStr = localStorage.getItem('user_data');

      if (authenticated && termsAccepted && userDataStr) {
        try {
          const data = JSON.parse(userDataStr);
          setUserData(data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          logout();
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_data');
    localStorage.removeItem('terms_accepted');
    localStorage.removeItem('terms_accepted_at');
    setIsAuthenticated(false);
    setUserData(null);
  };

  const login = () => {
    setIsAuthenticated(true);
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      setUserData(JSON.parse(userDataStr));
    }
  };

  return {
    isAuthenticated,
    userData,
    loading,
    login,
    logout
  };
}
