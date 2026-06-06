import { useState, useEffect, useCallback, useRef } from "react";
import type { AchievementKey } from "../constants/achievements";
import { useAuth } from "@/features/auth/components/AuthProvider";
import {
  fetchUnlockedAchievements,
  recordAchievementUnlock,
} from "../services/achievementServices";
import useEventEmitter from "@/features/events/hooks/useEventEmitter";

interface AchievementState {
  unlocked: Set<AchievementKey>;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook that manages the user's achievement state.
 *
 * - Loads unlocked achievements from Supabase on mount / auth change.
 * - Maintains an in-memory Set for optimistic unlock guards.
 * - Exposes `unlock(key)` which persists to DB and updates local state.
 */
export function useAchievements() {
  const emitter = useEventEmitter();
  const { user } = useAuth();
  const userId = user?.id;

  const [state, setState] = useState<AchievementState>({
    unlocked: new Set(),
    loading: false,
    error: null,
  });

  // Keep a ref to the current Set so we can read it synchronously inside unlock()
  const unlockedRef = useRef(state.unlocked);

  useEffect(() => {
    unlockedRef.current = state.unlocked;
  }, [state.unlocked]);

  // -------------------------------------------------------------------------
  // Load achievements when user changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ unlocked: new Set(), loading: false, error: null });
      return;
    }

    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchUnlockedAchievements(userId)
      .then((rows) => {
        if (cancelled) return;
        const keys = rows.map((r) => r.achievement_key);
        setState({
          unlocked: new Set(keys),
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({ ...prev, loading: false, error: err }));
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // -------------------------------------------------------------------------
  // Unlock an achievement (with optimistic guard)
  // -------------------------------------------------------------------------
  const unlock = useCallback(
    async (key: AchievementKey): Promise<boolean> => {
      if (!userId) {
        console.warn(
          "[useAchievements] Cannot unlock achievement: no authenticated user",
        );
        return false;
      }

      // Optimistic guard: already unlocked this session?
      if (unlockedRef.current.has(key)) return false;
      unlockedRef.current.add(key);

      try {
        const record = await recordAchievementUnlock(userId, key);

        if (record) {
          setState((prev) => {
            const next = new Set(prev.unlocked);
            next.add(key);
            return { ...prev, unlocked: next };
          });

          emitter.emit("achievement_unlocked", { key });
          return true;
        }

        // record === null means already existed (unique violation)
        unlockedRef.current.delete(key);
        return false;
      } catch (err) {
        console.error("[useAchievements] unlock failed:", err);

        unlockedRef.current.delete(key);
        return false;
      }
    },
    [userId, emitter],
  );

  const hasUnlocked = useCallback(
    (key: AchievementKey): boolean => {
      return state.unlocked.has(key);
    },
    [state.unlocked],
  );

  return {
    unlocked: state.unlocked,
    loading: state.loading,
    error: state.error,
    unlock,
    hasUnlocked,
  };
}
