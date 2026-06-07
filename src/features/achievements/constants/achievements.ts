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
export const ACHIEVEMENTS: Record<
  string,
  {
    name: string;
    description: string;
    category: AchievementCategory;
    rewards: AchievementReward[];
  }
> = {
  // ── Progression ──────────────────────────────────────────────────────────
  first_register: {
    name: "Welcome!",
    description: "Register your account.",
    category: "progression",
    rewards: [],
  },

  classic_lvl_5: {
    name: "First Steps",
    description: "Reach level 5 in Classic mode.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "timeattack" }],
  },

  timeattack_lvl_5: {
    name: "Against the Clock",
    description: "Reach level 5 in Time Attack.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "blitz" }],
  },

  blitz_lvl_5: {
    name: "Lightning Reflexes",
    description: "Reach level 5 in Blitz Mode.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "echo" }],
  },

  echo_lvl_5: {
    name: "Signal Tracking",
    description: "Reach level 5 in Echo Protocol.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "ghost" }],
  },

  ghost_lvl_5: {
    name: "Blind Memory",
    description: "Reach level 5 in Ghost Protocol.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "fragment" }],
  },

  fragment_lvl_5: {
    name: "Partial Data",
    description: "Reach level 5 in Fragment Protocol.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "entropy" }],
  },

  entropy_lvl_5: {
    name: "System Instability",
    description: "Reach level 5 in Entropy Protocol.",
    category: "progression",
    rewards: [{ type: "unlock_mode", mode: "burst" }],
  },

  // ── Mastery ──────────────────────────────────────────────────────────────
  classic_lvl_10: {
    name: "Getting Serious",
    description: "Reach level 10 in Classic mode.",
    category: "progression",
    rewards: [{ type: "title", title: "Veteran" }],
  },

  classic_lvl_20: {
    name: "Simon Master",
    description: "Reach level 20 in Classic mode.",
    category: "mastery",
    rewards: [{ type: "theme", theme: "gold" }],
  },

  blitz_lvl_20: {
    name: "Lightning Incarnate",
    description: "Reach level 20 in Blitz Mode.",
    category: "mastery",
    rewards: [{ type: "title", title: "Speedrunner" }],
  },

  echo_lvl_20: {
    name: "Perfect Resonance",
    description: "Reach level 20 in Echo Protocol.",
    category: "mastery",
    rewards: [{ type: "title", title: "Listener" }],
  },

  ghost_lvl_20: {
    name: "Into the Void",
    description: "Reach level 20 in Ghost Protocol.",
    category: "mastery",
    rewards: [{ type: "theme", theme: "shadow" }],
  },

  fragment_lvl_20: {
    name: "Recovered Archives",
    description: "Reach level 20 in Fragment Protocol.",
    category: "mastery",
    rewards: [{ type: "title", title: "Archivist" }],
  },

  entropy_lvl_20: {
    name: "System Corruption",
    description: "Reach level 20 in Entropy Protocol.",
    category: "mastery",
    rewards: [{ type: "theme", theme: "glitch" }],
  },

  burst_lvl_20: {
    name: "Final Transmission",
    description: "Reach level 20 in Burst Transmission.",
    category: "mastery",
    rewards: [{ type: "title", title: "Transmission Master" }],
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
