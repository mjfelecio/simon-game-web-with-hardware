import { useCallback } from "react";
import { useAchievements } from "./useAchievements";
import type { AppEvents } from "@/features/events/appEvents";
import useEventListener from "@/features/events/hooks/useEventListener";
import { isAchievementKey } from "../constants/achievements";

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
      const { mode, level } = payload;

      // For level dependent unlocks
      if (level >= 5) {
        const key = `${mode}_lvl_5`;
        if (isAchievementKey(key)) {
          await unlock(key);
        }
      }
      if (level >= 10) {
        const key = `${mode}_lvl_10`;
        if (isAchievementKey(key)) {
          await unlock(key);
        }
      }
      if (level >= 20) {
        const key = `${mode}_lvl_20`;
        if (isAchievementKey(key)) {
          await unlock(key);
        }
      }

      // ── Speed achievement ────────────────────────────────────────────────
      // if (payload.timeTakenMs !== undefined && payload.timeTakenMs < 2000) {
      //   await unlock("speed_demon");
      // }
    },
    [unlock],
  );

  const handleUserRegistration = useCallback(async () => {
    await unlock("first_register");
  }, [unlock]);

  useEventListener("game_completed", handleGameCompleted);
  useEventListener("registration", handleUserRegistration);
}
