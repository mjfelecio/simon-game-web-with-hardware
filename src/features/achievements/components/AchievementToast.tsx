import { useCallback } from "react";
import toast from "react-hot-toast";
import { ACHIEVEMENTS, isAchievementKey } from "../constants/achievements";
import type { AppEvents } from "@/features/events/appEvents";
import useEventListener from "@/features/events/hooks/useEventListener";

/**
 * Renders nothing itself. Listens for achievement_unlocked events and
 * displays a toast notification with the achievement details.
 *
 * Place this inside AuthProvider + EventBusProvider.
 */
export function AchievementToast() {
  const handleUnlock = useCallback((payload: AppEvents["achievement_unlocked"]) => {
    const { key } = payload;

    if (!isAchievementKey(key)) {
      console.warn("[AchievementToast] Unknown achievement key:", key);
      return;
    }

    const def = ACHIEVEMENTS[key];

    toast.success(
      <div className="flex items-center gap-3">
        {/* <span className="text-2xl">{def.icon}</span> */}
        <div>
          <p className="font-bold">Achievement Unlocked!</p>
          <p className="text-sm opacity-80">{def.name}</p>
          <p className="text-xs opacity-60">{def.description}</p>
        </div>
      </div>,
      {
        duration: 4000,
        icon: undefined,
        style: {
          border: "1px solid rgba(255, 215, 0, 0.3)",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#fff",
        },
      },
    );
  }, []);

  useEventListener("achievement_unlocked", handleUnlock);

  return null;
}