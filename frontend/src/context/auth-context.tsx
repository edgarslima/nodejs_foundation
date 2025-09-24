'use client';

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ApiClient, type ApiFetchOptions } from "@/services/api-client";

interface UserProfile {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  apiClient: ApiClient;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const createInitialState = (): AuthState => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(createInitialState);
  const apiClientRef = useRef<ApiClient | null>(null);

  const handleAuthenticated = useCallback((payload: { accessToken: string; user: UserProfile }) => {
    apiClientRef.current?.setAccessToken(payload.accessToken);
    setState({
      isAuthenticated: true,
      isLoading: false,
      user: payload.user,
      accessToken: payload.accessToken
    });
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch("/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { accessToken?: string; user?: UserProfile };
      if (data.accessToken) {
        apiClientRef.current?.setAccessToken(data.accessToken);
        setState((prev) => ({
          ...prev,
          accessToken: data.accessToken ?? null,
          user: data.user ?? prev.user,
          isAuthenticated: Boolean(data.accessToken)
        }));
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const apiClient = useMemo(() => {
    const client = new ApiClient({ refresh: refreshAccessToken });
    apiClientRef.current = client;
    return client;
  }, [refreshAccessToken]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.request<{ accessToken: string; user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    handleAuthenticated(response);
  }, [apiClient, handleAuthenticated]);

  const register = useCallback(async (input: { email: string; password: string }) => {
    await apiClient.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
    await login(input.email, input.password);
  }, [apiClient, login]);

  const logout = useCallback(async () => {
    try {
      await apiClient.request("/auth/logout", { method: "POST" });
    } finally {
      apiClient.setAccessToken(null);
      setState({ ...createInitialState(), isLoading: false });
    }
  }, [apiClient]);

  const refreshSession = useCallback(async () => {
    await refreshAccessToken();
  }, [refreshAccessToken]);

  useEffect(() => {
    let active = true;
    const bootstrap = async (): Promise<void> => {
      try {
        const response = await apiClient.request<{ accessToken: string; user: UserProfile }>("/auth/refresh", {
          method: "POST",
          retryOn401: false
        });
        if (!active) return;
        handleAuthenticated(response);
      } catch {
        if (!active) return;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    void bootstrap();

    return () => {
      active = false;
    };
  }, [apiClient, handleAuthenticated]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshSession,
    apiClient
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const withAuthFetch = <T,>(client: ApiClient, path: string, options?: ApiFetchOptions): Promise<T> => {
  return client.request<T>(path, options);
};