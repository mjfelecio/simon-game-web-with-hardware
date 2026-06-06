import type { GameMode } from "@/globals/types/simon";

export type AchievementReward =
  | { type: "unlock_mode"; mode: GameMode }
  | { type: "title"; title: string }
  | { type: "theme"; theme: string };

/**
 * Discriminated union helper for narrowing reward types.
 */
export type RewardType = AchievementReward["type"];