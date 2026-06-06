import type { GameMode } from "@/globals/types/simon";
import type { AchievementKey } from "../achievements/constants/achievements";

/**
 * Application-wide event bus contract.
 *
 * Events are domain-level signals that any feature can emit or listen to.
 * Keep this flat and well-documented. If an event's purpose is unclear,
 * it doesn't belong here yet.
 */
export type AppEvents = {
  /**
   * Fired when a user successfully registers their account.
   * Payload contains the authenticated user's ID.
   */
  registration: { userId: string };

  /**
   * Fired when a game session ends (win or loss).
   * Used by achievements, leaderboard, analytics, and audio systems.
   */
  game_completed: {
    mode: GameMode;
    level: number;
    timeTakenMs?: number;
    won: boolean;
  };

  game_advance: {
    mode: GameMode;
    level: number;
    timeTakenMs?: number;
  };

  /**
   * Fired when an achievement is unlocked.
   * Consumed by toast notifications, persistence layer, and reward applicators.
   */
  achievement_unlocked: {
    key: AchievementKey;
  };

  /**
   * Fired when a reward is applied to the user's account/settings.
   * Decouples achievement unlock from reward side-effects.
   */
  reward_applied: {
    achievementKey: AchievementKey;
    rewardType: "unlock_mode" | "title" | "theme";
    value: string;
  };
};

/**
 * Discriminated union of all event names for type-safe iteration.
 */
export type AppEventName = keyof AppEvents;