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
  emailFromUsername,
  SESSION_STORAGE_PROCEED_AS_GUEST,
} from "@/features/auth/constants/auth";
import type { User } from "@/globals/types/auth";
import { supabase } from "@/globals/libs/db";
import { toastSuccess, toastWarning } from "@/globals/utils/toast";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isAGuest: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
  proceedAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAGuest, setIsAGuest] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (authUserId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUserId)
      .maybeSingle();

    if (!data) {
      setUser(null);
      return;
    }

    setUser(data);
    setIsAGuest(false);
  };

  const login = useCallback(async (username: string, password: string) => {
    const email = emailFromUsername(username);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      throw new Error("Failed to retrieve user.");
    }

    sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);
    await loadProfile(authUser.id);

    toastSuccess("Success", {
      description: `Logged in successfully. Hi ${username}!`,
    });
  }, []);

  const register = useCallback(
    async (email: string, password: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim().toLowerCase(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("User creation failed.");
      }

      sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);
      await loadProfile(data.user.id);
      toastSuccess("Success", {
        description: `Registered successfully. Hi ${username}!`,
      });
    },
    [],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();

    sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);

    setUser(null);
    setIsAGuest(false);
    toastSuccess("Success", {
      description: "Logged out successfully",
    });
  }, []);

  const proceedAsGuest = useCallback(async () => {
    await supabase.auth.signOut();

    sessionStorage.setItem(
      SESSION_STORAGE_PROCEED_AS_GUEST,
      JSON.stringify(true),
    );

    setUser(null);
    setIsAGuest(true);

    toastWarning("Proceeding as guest", {
      description: "Your scores will not be submitted.",
    });
  }, []);

  // Restore auth state on initial load
  useEffect(() => {
    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();


        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          const storedGuestFlag = sessionStorage.getItem(
            SESSION_STORAGE_PROCEED_AS_GUEST,
          );

          if (storedGuestFlag) {
            setIsAGuest(JSON.parse(storedGuestFlag));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id);
        return;
      }

      setUser(null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAGuest,
      isLoading,
      login,
      logout,
      register,
      proceedAsGuest,
    }),
    [user, isLoading, isAGuest, login, logout, register, proceedAsGuest],
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
