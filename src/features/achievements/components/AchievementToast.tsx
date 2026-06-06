import { useCallback } from "react";
import toast, { type Toast } from "react-hot-toast";
import { ACHIEVEMENTS, isAchievementKey } from "../constants/achievements";
import type { AppEvents } from "@/features/events/appEvents";
import useEventListener from "@/features/events/hooks/useEventListener";
import { Trophy } from "lucide-react";
import { cn } from "@/globals/libs/styleUtils";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";

/**
 * Renders nothing itself. Listens for achievement_unlocked events and
 * displays a toast notification with the achievement details.
 *
 * Place this inside AuthProvider + EventBusProvider.
 */
export function AchievementToast() {
  const handleUnlock = useCallback(
    (payload: AppEvents["achievement_unlocked"]) => {
      const { key } = payload;

      if (!isAchievementKey(key)) {
        console.warn("[AchievementToast] Unknown achievement key:", key);
        return;
      }

      const def = ACHIEVEMENTS[key];

      sfxPlayer.play(SFX.ACHIEVEMENT);

      toast.custom(
        (t) => (
          <AchievementToastCard
            t={t}
            title={def.name}
            description={def.description}
          />
        ),
        {
          duration: 5000,
        },
      );
    },
    [],
  );

  useEventListener("achievement_unlocked", handleUnlock);

  return null;
}

type Props = {
  t: Toast;
  title: string;
  description: string;
};

const AchievementToastCard = ({ t, title, description }: Props) => {
  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-md overflow-hidden",
        "rounded-2xl border border-yellow-400/20",
        "bg-linear-to-br from-amber-500/15 via-yellow-500/10 to-orange-500/15",
        "backdrop-blur-xl shadow-2xl shadow-yellow-500/10",
        "transition-all duration-300",
        t.visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}
    >
      {/* Top glow bar */}
      <div className="h-1 w-full bg-linear-to-r from-yellow-300 via-amber-400 to-orange-400" />

      <div className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center",
            "rounded-2xl border border-yellow-400/20",
            "bg-yellow-500/10",
          )}
        >
          <Trophy className="h-7 w-7 text-yellow-300" />
        </div>

        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">
            Achievement Unlocked
          </p>

          <h3 className="mt-1 text-xl font-black text-white tracking-wider">{title}</h3>

          <p className="mt-1 text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
};
