import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { fetchAchievementsForUser } from "@/features/achievements/services/achievementServices";
import type { GameMode } from "@/globals/types/simon";
import { FEATURE_FLAGS } from "@/globals/constants/featureFlags";

type ContextValue = {
  unlockedModes: GameMode[];
  isUnlocked: (mode: GameMode) => boolean;
  loading: boolean;
};

const GamemodeContext = createContext<ContextValue | null>(null);

const STORAGE_KEY = "unlocked_gamemodes";

const ALL_MODES: GameMode[] = [
  "classic",
  "echo",
  "burst",
  "blitz",
  "fragment",
  "entropy",
  "ghost",
  "timeattack",
];

export function GamemodeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [unlockedModes, setUnlockedModes] = useState<GameMode[]>(() => {
    if (!FEATURE_FLAGS.achievementsEnabled) return ALL_MODES;

    const cached = localStorage.getItem(STORAGE_KEY);

    if (!cached) return ["classic"];

    try {
      return JSON.parse(cached);
    } catch {
      return ["classic"];
    }
  });

  useEffect(() => {
    if (!FEATURE_FLAGS.achievementsEnabled) {
      setLoading(false);
      return;
    }

    if (!user) {
      setUnlockedModes(["classic"]);
      setLoading(false);
      return;
    }

    const initialize = async () => {
      setLoading(true);

      try {
        const achievements = await fetchAchievementsForUser(user.id);

        const modes = new Set<GameMode>();

        modes.add("classic");

        achievements
          .filter((a) => a.unlocked)
          .forEach((achievement) => {
            achievement.rewards.forEach((r) => {
              if (r.type === "unlock_mode") {
                modes.add(r.mode);
              }
            });
          });

        const result = [...modes];

        setUnlockedModes(result);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user]);

  const value = useMemo(
    () => ({
      unlockedModes,
      loading,
      isUnlocked: (mode: GameMode) => unlockedModes.includes(mode),
    }),
    [loading, unlockedModes],
  );

  return (
    <GamemodeContext.Provider value={value}>
      {children}
    </GamemodeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGamemodes() {
  const context = useContext(GamemodeContext);

  if (!context) {
    throw new Error("useGamemodes must be used inside GamemodeProvider");
  }

  return context;
}
