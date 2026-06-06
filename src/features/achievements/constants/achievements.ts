import type { AchievementReward } from "./rewards";

export type AchievementCategory =
  | "progression"
  | "mastery"
  | "social"
  | "secret";

/**
 * Flat record of all achievements. The key IS the achievement ID.
 * This eliminates recursive type gymnastics and prevents silent key collisions.
 */
export const ACHIEVEMENTS = {
  // ── Progression ──────────────────────────────────────────────────────────
  first_register: {
    name: "Welcome!",
    description: "Register your account.",
    category: "progression" as AchievementCategory,
    icon: "👋",
    rewards: [] as AchievementReward[],
  },

  classic_lvl_5: {
    name: "First Steps",
    description: "Reach level 5 in Classic mode.",
    category: "progression" as AchievementCategory,
    icon: "🎯",
    rewards: [] as AchievementReward[],
  },

  classic_lvl_10: {
    name: "Getting Serious",
    description: "Reach level 10 in Classic mode.",
    category: "progression" as AchievementCategory,
    icon: "🔥",
    rewards: [
      { type: "title", title: "Veteran" } as const satisfies AchievementReward,
    ],
  },

  classic_lvl_20: {
    name: "Simon Master",
    description: "Reach level 20 in Classic mode.",
    category: "mastery" as AchievementCategory,
    icon: "👑",
    rewards: [
      { type: "unlock_mode", mode: "blitz" } as const satisfies AchievementReward,
      { type: "theme", theme: "gold" } as const satisfies AchievementReward,
    ],
  },

  // ── Mastery ──────────────────────────────────────────────────────────────
  speed_demon: {
    name: "Speed Demon",
    description: "Complete a level in under 2 seconds.",
    category: "mastery" as AchievementCategory,
    icon: "⚡",
    rewards: [] as AchievementReward[],
  },

  // ── Social ───────────────────────────────────────────────────────────────
  // (placeholder for future social features)

  // ── Secret ───────────────────────────────────────────────────────────────
  // (placeholder for easter eggs)
} as const;

/**
 * Derive the AchievementKey type directly from the record keys.
 */
export type AchievementKey = keyof typeof ACHIEVEMENTS;

/**
 * Runtime validation: check if a string is a known achievement key.
 */
export function isAchievementKey(key: string): key is AchievementKey {
  return key in ACHIEVEMENTS;
}

/**
 * Achievement definition as stored in the database.
 */
export interface AchievementRecord {
  id: string; // UUID from Supabase
  key: AchievementKey;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  created_at: string;
  rewards: AchievementReward[];
}

/**
 * User's unlocked achievement row from Supabase.
 */
export interface UnlockedAchievement {
  id: number; // Auto incremented
  user_id: string;
  achievement_key: AchievementKey;
  unlocked_at: string;
}