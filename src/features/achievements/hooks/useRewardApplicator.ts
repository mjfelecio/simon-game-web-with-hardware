import type { AppEvents } from "@/features/events/appEvents";
import useEventListener from "@/features/events/hooks/useEventListener";
import { useCallback } from "react";
// import { useSettings } from "@/globals/providers/SettingsProvider";

/**
 * Headless hook that listens for `reward_applied` events and mutates
 * the appropriate stores (settings, unlocked modes, titles, etc.).
 *
 * This is the SINGLE place where achievement rewards touch external systems.
 * If you add a new reward type, add the handler here.
 */
export function useRewardApplicator() {
  // const { setTheme, unlockMode, setTitle } = useSettings();

  const handleRewardApplied = useCallback(
    (payload: AppEvents["reward_applied"]) => {
      const { rewardType } = payload;

      switch (rewardType) {
        case "theme":
          // setTheme(value);
          break;

        case "unlock_mode":
          // unlockMode(value);
          break;

        case "title":
          // setTitle(value);
          break;
      }
    },
    // [setTheme, unlockMode, setTitle],
    [],
  );

  useEventListener("reward_applied", handleRewardApplied);
}