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
   */
  game_ended: {
    mode: GameMode;
    /**
     * Level completed when the game ended.
     *
     * @note
     *  This does not include failed levels.
     *  The caller of this event should make sure
     *  that the example below is followed when
     *  providing the level value.
     * @example
     *  - user won at level 5 -> level: 5
     *  - user lost at level 5 -> level: 4
     */
    level: number;
    timeTakenMs?: number;
    won: boolean;
    isCampaign: boolean;
  };

  /**
   * Fired when the game advances to the next round
   */
  game_advance_to_next_level: {
    mode: GameMode;
    /**
     * New level after advancing to the next round.
     */
    level: number;
    isCampaign: boolean;
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
