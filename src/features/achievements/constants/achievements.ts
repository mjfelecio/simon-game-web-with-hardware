import type { AchievementReward } from "./rewards";

export type AchievementCategory =
  | "progression"
  | "mastery"
  | "social"
  | "secret";

export const ACHIEVEMENT_KEYS = [
  "first_register",
  "classic_lvl_5",
  "timeattack_lvl_5",
  "blitz_lvl_5",
  "echo_lvl_5",
  "ghost_lvl_5",
  "fragment_lvl_5",
  "entropy_lvl_5",
  "classic_lvl_10",
  "classic_lvl_20",
  "blitz_lvl_20",
  "echo_lvl_20",
  "ghost_lvl_20",
  "fragment_lvl_20",
  "entropy_lvl_20",
  "burst_lvl_20",
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_KEYS)[number];

/**
 * Runtime validation: check if a string is a known achievement key.
 */
export function isAchievementKey(key: string): key is AchievementKey {
  return (ACHIEVEMENT_KEYS as readonly string[]).includes(key);
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
