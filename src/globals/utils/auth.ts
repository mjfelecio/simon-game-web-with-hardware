import { SESSION_STORAGE_KEY } from "@/globals/constants/auth";
import type { User } from "@/globals/types/auth";

/**
 * Helper function to retrieve the current logged-in user.
 */
export const getStoredUser = (): User | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

/**
 * Helper function to clear the stored session.
 */
export const logout = () => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};