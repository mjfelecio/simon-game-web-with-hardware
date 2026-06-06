import { useCallback } from "react";
import { useAchievements } from "./useAchievements";
import type { AppEvents } from "@/features/events/appEvents";
import useEventListener from "@/features/events/hooks/useEventListener";

/**
 * Headless hook that listens to game events and unlocks achievements.
 *
 * Place this inside a component that lives inside AuthProvider + EventBusProvider.
 * It has no UI — it only wires events to the achievement persistence layer.
 */
export function useAchievementUnlocker() {
  const { unlock } = useAchievements();

  const handleGameCompleted = useCallback(
    async (payload: AppEvents["game_completed"]) => {
      const { mode, level, won } = payload;

      if (!won) return; // No achievements for losing

      // ── Classic mode level achievements ──────────────────────────────────
      if (mode === "classic") {
        if (level >= 5) {
          await unlock("classic_lvl_5");
        }
        if (level >= 10) {
          await unlock("classic_lvl_10");
        }
        if (level >= 20) {
          await unlock("classic_lvl_20");
        }
      }

      // ── Speed achievement ────────────────────────────────────────────────
      if (payload.timeTakenMs !== undefined && payload.timeTakenMs < 2000) {
        await unlock("speed_demon");
      }
    },
    [unlock],
  );

  const handleUserLogin = useCallback(
    async () => {
      await unlock("login");
    },
    [unlock],
  );

  useEventListener("game_completed", handleGameCompleted);
  useEventListener("user_login", handleUserLogin);
}