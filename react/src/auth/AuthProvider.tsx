import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useRefreshMutation,
  useMeQuery,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
  AuthUser,
} from '@/services/usersApi';

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [accessToken, setToken] = useState<string>(getAccessToken());
  const [user, setUser] = useState<AuthUser | null>(null);

  const { data: meData, isLoading: meLoading, refetch } = useMeQuery(undefined, {
    skip: !accessToken,
  });

  const [loginMut] = useLoginMutation();
  const [registerMut] = useRegisterMutation();
  const [logoutMut] = useLogoutMutation();
  const [refreshMut] = useRefreshMutation();

  // initial try refresh if no token
  useEffect(() => {
    const boot = async () => {
      if (!getAccessToken()) {
        const res = await refreshMut().unwrap().catch(() => null);
        if (res?.accessToken) {
          setAccessToken(res.accessToken);
          setToken(res.accessToken);
          setUser(res.user);
        }
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (meData) setUser(meData);
  }, [meData]);

  const login = async (identifier: string, password: string) => {
    const res = await loginMut({ identifier, password }).unwrap();
    setAccessToken(res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await registerMut({ username, email, password }).unwrap();
    setAccessToken(res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    await logoutMut().unwrap().catch(() => {});
    clearAccessToken();
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, accessToken, loading: meLoading, login, register, logout }),
    [user, accessToken, meLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};