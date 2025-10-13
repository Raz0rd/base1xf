'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserData {
  name: string;
  email: string;
  phone: string;
  loginAt: string;
  playerId?: string;
  verified?: boolean;
  verifiedAt?: number;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    console.log('[Auth] 🚪 Fazendo logout...');
    localStorage.removeItem('user_authenticated');
    localStorage.removeItem('user_data');
    localStorage.removeItem('terms_accepted');
    localStorage.removeItem('terms_accepted_at');
    // Limpar também dados de verificação
    localStorage.removeItem('userVerified');
    localStorage.removeItem('userPlayerId');
    localStorage.removeItem('userData');
    localStorage.removeItem('verificationData');
    localStorage.removeItem('verificationExpiry');
    setIsAuthenticated(false);
    setUserData(null);
  }, []);

  useEffect(() => {
    console.log('[Auth] 🚀 useEffect executando...');
    
    const checkAuth = () => {
      console.log('[Auth] 🔍 Verificando autenticação...');
      
      if (typeof window === 'undefined') {
        console.log('[Auth] ❌ Window não disponível');
        return;
      }

      const authenticated = localStorage.getItem('user_authenticated') === 'true';
      const termsAccepted = localStorage.getItem('terms_accepted') === 'true';
      const userDataStr = localStorage.getItem('user_data');

      console.log('[Auth] Verificando autenticação:', {
        authenticated,
        termsAccepted,
        hasUserData: !!userDataStr
      });

      if (authenticated && termsAccepted && userDataStr) {
        try {
          const data = JSON.parse(userDataStr);
          setUserData(data);
          setIsAuthenticated(true);
          console.log('[Auth] ✅ Usuário autenticado:', data.name);
        } catch (error) {
          console.error('[Auth] ❌ Erro ao carregar dados do usuário:', error);
          logout();
        }
      } else {
        console.log('[Auth] ❌ Usuário NÃO autenticado - Modal deve aparecer');
      }

      console.log('[Auth] 🏁 Finalizando verificação. setLoading(false)');
      setLoading(false);
    };

    checkAuth();
    console.log('[Auth] ✅ useEffect concluído');
  }, [logout]);

  const login = useCallback(() => {
    console.log('[Auth] 🔐 Fazendo login...');
    setIsAuthenticated(true);
    setLoading(false); // IMPORTANTE: Marca loading como false
    const userDataStr = localStorage.getItem('user_data');
    if (userDataStr) {
      const data = JSON.parse(userDataStr);
      setUserData(data);
      console.log('[Auth] ✅ Login concluído:', data.name);
    }
  }, []);

  return {
    isAuthenticated,
    userData,
    loading,
    login,
    logout
  };
}
