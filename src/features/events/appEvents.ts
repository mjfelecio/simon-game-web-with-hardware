import type { GameMode } from "@/globals/types/simon";

/**
 * Application-wide event bus contract.
 *
 * Events are domain-level signals that any feature can emit or listen to.
 * Keep this flat and well-documented. If an event's purpose is unclear,
 * it doesn't belong here yet.
 */
export type AppEvents = {
  /**
   * Fired when a user successfully authenticates.
   * Payload contains the authenticated user's ID for achievement tracking.
   */
  user_login: { userId: string };

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

  /**
   * Fired when an achievement is unlocked.
   * Consumed by toast notifications, persistence layer, and reward applicators.
   */
  achievement_unlocked: {
    key: string; // AchievementKey — kept as string to avoid circular imports
    unlockedAt: string; // ISO timestamp
  };

  /**
   * Fired when a reward is applied to the user's account/settings.
   * Decouples achievement unlock from reward side-effects.
   */
  reward_applied: {
    achievementKey: string;
    rewardType: "unlock_mode" | "title" | "theme";
    value: string;
  };
};

/**
 * Discriminated union of all event names for type-safe iteration.
 */
export type AppEventName = keyof AppEvents;