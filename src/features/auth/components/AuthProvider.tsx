import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  SESSION_STORAGE_PLAYER_KEY,
  SESSION_STORAGE_PROCEED_AS_GUEST,
} from "@/features/auth/constants/auth";
import type { User } from "@/globals/types/auth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAGuest: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  proceedAsGuest: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAGuest, setIsAGuest] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  // Restore state from sessionStorage on initial load
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(SESSION_STORAGE_PLAYER_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
        return;
      }

      const isAGuest = sessionStorage.getItem(SESSION_STORAGE_PROCEED_AS_GUEST);

      if (isAGuest) {
        setIsAGuest(JSON.parse(isAGuest));
        return;
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
      sessionStorage.removeItem(SESSION_STORAGE_PLAYER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: User) => {
    sessionStorage.setItem(SESSION_STORAGE_PLAYER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);

    setUser(user);
    setIsAGuest(false);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_PLAYER_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);

    setUser(null);
    setIsAGuest(false);
  }, []);

  const proceedAsGuest = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_PLAYER_KEY);
    sessionStorage.setItem(
      SESSION_STORAGE_PROCEED_AS_GUEST,
      JSON.stringify(true),
    );
    setUser(null);
    setIsAGuest(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAGuest,
      isLoading,
      login,
      logout,
      proceedAsGuest,
    }),
    [user, isLoading, isAGuest, login, logout, proceedAsGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
