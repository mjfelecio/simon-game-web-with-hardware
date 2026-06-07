import { supabase } from "@/globals/libs/db";
import {
  type AchievementCategory,
  type AchievementKey,
  type AchievementRecord,
  type UnlockedAchievement,
} from "../constants/achievements";
import type { AchievementReward } from "../constants/rewards";

const TABLE = "unlocked_achievements";

export type AchievementView = AchievementRecord & {
  unlocked: boolean;
  unlockedAt?: string;
};

export async function fetchAchievementsForUser(
  userId: string | null,
): Promise<AchievementView[]> {
  let unlockedMap: undefined | Map<AchievementKey, string>;

  if (userId !== null) {
    try {
      const unlocked = await fetchUnlockedAchievements(userId);

      unlockedMap = new Map(
        unlocked.map((a) => [a.achievement_key, a.unlocked_at]),
      );
    } catch {
      console.warn("User must be logged in to see their progress")
    }
  }

  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .order("category", { ascending: false });

  if (error) {
    console.error("[AchievementService] fetch all achievements failed:", error);
    throw error;
  }

  return data.map((achievement) => ({
    id: achievement.id,
    key: achievement.key as AchievementKey,
    name: achievement.name ?? "",
    description: achievement.description ?? "",
    category: achievement.category as AchievementCategory,
    icon: achievement.icon ?? "",
    rewards: achievement.rewards as AchievementReward[],
    created_at: "",
    unlocked: unlockedMap?.has(achievement.key as AchievementKey) ?? false,
    unlockedAt:
      unlockedMap?.get(achievement.key as AchievementKey) ?? undefined,
  }));
}

/**
 * Fetch all achievements unlocked by a specific user.
 */
export async function fetchUnlockedAchievements(
  userId: string,
): Promise<UnlockedAchievement[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  if (error) {
    console.error(
      "[AchievementService] fetchUnlockedAchievements failed:",
      error,
    );
    throw error;
  }

  return (data as UnlockedAchievement[]) ?? [];
}

/**
 * Check if a user has already unlocked a specific achievement.
 */
export async function hasUnlockedAchievement(
  userId: string,
  key: AchievementKey,
): Promise<boolean> {
  const { count, error } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("achievement_key", key);

  if (error) {
    console.error("[AchievementService] hasUnlockedAchievement failed:", error);
    throw error;
  }

  return (count ?? 0) > 0;
}

/**
 * Record a newly unlocked achievement for a user.
 * Returns the inserted row or null if it already exists (upsert behavior).
 */
export async function recordAchievementUnlock(
  userId: string,
  key: AchievementKey,
): Promise<UnlockedAchievement | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: userId,
      achievement_key: key,
      unlocked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation — achievement already unlocked, swallow silently
    if (error.code === "23505") {
      return null;
    }
    console.error(
      "[AchievementService] recordAchievementUnlock failed:",
      error,
    );
    throw error;
  }

  return data as UnlockedAchievement;
}
