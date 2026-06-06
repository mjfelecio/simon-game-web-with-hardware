import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import useEventEmitter from "@/features/events/hooks/useEventEmitter";

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
  const emitter = useEventEmitter();

  const [user, setUser] = useState<User | null>(null);
  const [isAGuest, setIsAGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMountedRef = useRef(true);
  const loadingProfileRef = useRef(false);

  const loadProfile = useCallback(async (authUserId: string) => {
    if (loadingProfileRef.current) return;
    loadingProfileRef.current = true;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .maybeSingle();

      if (error) {
        console.error(error);
        if (isMountedRef.current) setUser(null);
        return;
      }

      if (!data) {
        if (isMountedRef.current) setUser(null);
        return;
      }

      if (isMountedRef.current) {
        setUser(data);
        setIsAGuest(false);
      }
    } catch (error) {
      console.error(error);
      if (isMountedRef.current) setUser(null);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
      loadingProfileRef.current = false;
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
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
    },
    [loadProfile],
  );

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

      // Delay to ensure that loading a profile has finished
      setTimeout(
        () => emitter.emit("registration", { userId: data?.user?.id ?? "" }),
        1000,
      );
    },
    [loadProfile, emitter],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();

    sessionStorage.removeItem(SESSION_STORAGE_PROCEED_AS_GUEST);

    if (isMountedRef.current) {
      setUser(null);
      setIsAGuest(false);
    }
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

    if (isMountedRef.current) {
      setUser(null);
      setIsAGuest(true);
    }

    toastWarning("Proceeding as guest", {
      description: "Your scores will not be submitted.",
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const initialize = async () => {
      try {
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((resolve) => setTimeout(resolve, 500)),
        ]);

        if (!result) {
          if (isMountedRef.current) setIsLoading(false);
          return;
        }

        const {
          data: { session },
        } = result;

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          const storedGuestFlag = sessionStorage.getItem(
            SESSION_STORAGE_PROCEED_AS_GUEST,
          );

          if (storedGuestFlag && isMountedRef.current) {
            setIsAGuest(JSON.parse(storedGuestFlag));
          }
          if (isMountedRef.current) setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        if (!isMountedRef.current) return;

        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }, 0);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

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
