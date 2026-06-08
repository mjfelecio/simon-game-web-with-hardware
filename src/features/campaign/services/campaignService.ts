import { supabase } from "@/globals/libs/db";
import { type Tables } from "@/globals/types/database";

import type { GameMode } from "@/globals/types/simon";

/** Row shape returned by the campaign_progress table. */
export type CampaignProgressRow = Tables<"campaign_progress">;

/**
 * Payload to update a user's highest reached level for a specific game mode.
 */
export interface UpdateCampaignProgressPayload {
  /** Authenticated user's UUID. */
  userId: string;
  /** The game mode being played (e.g. "classic", "blitz"). */
  gameMode: GameMode;
  /** The level the user just reached. */
  level: number;
}

/**
 * Payload to update a user's highest reached level for a specific game mode.
 */
export interface FetchCampaignProgressParams {
  /** Authenticated user's UUID. */
  userId: string;
  /** The game mode being played (e.g. "classic", "blitz"). */
  gameMode: GameMode;
}

export async function fetchCampaignProgress(
  params: FetchCampaignProgressParams,
): Promise<CampaignProgressRow | null> {
  const { userId, gameMode } = params;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!userId || typeof userId !== "string") {
    throw new Error("[fetchCampaignProgress] userId must be a non-empty string");
  }
  if (!gameMode || typeof gameMode !== "string") {
    throw new Error("[fetchCampaignProgress] gameMode must be a non-empty string");
  }

  // Fetch existing progress
  const { data: existing, error: fetchError } = await supabase
    .from("campaign_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("mode", gameMode)
    .maybeSingle();

  if (fetchError) {
    console.error("[fetchCampaignProgress] fetch failed:", fetchError);
    throw new Error(
      `Failed to read campaign progress: ${fetchError.message}`,
    );
  }

  return existing;
}

/**
 * Upserts the user's campaign progress, but only if the new level is strictly
 * greater than the stored `highest_level`.
 *
 * ⚠️  Race condition notice: this function reads then writes. Under concurrent
 * requests the final value may not be the true maximum. For strict atomicity
 * (e.g. leaderboards), replace this with a PostgreSQL RPC that uses
 * `INSERT ... ON CONFLICT ... DO UPDATE SET highest_level = GREATEST(...)` .
 *
 * @param payload - See {@link UpdateCampaignProgressPayload}
 * @returns The updated record, or `null` when the provided level did not beat
 *          the existing high score.
 * @throws When the database query fails or inputs are invalid.
 */
export async function updateCampaignProgress(
  payload: UpdateCampaignProgressPayload,
): Promise<CampaignProgressRow | null> {
  const { userId, gameMode, level } = payload;

  // ── Input validation ─────────────────────────────────────────────────────
  if (!userId || typeof userId !== "string") {
    throw new Error("[updateCampaignProgress] userId must be a non-empty string");
  }
  if (!gameMode || typeof gameMode !== "string") {
    throw new Error("[updateCampaignProgress] gameMode must be a non-empty string");
  }
  if (!Number.isFinite(level) || level < 0 || !Number.isInteger(level)) {
    throw new Error(
      "[updateCampaignProgress] level must be a non-negative integer",
    );
  }

  // Fetch existing progress
  const existing = await fetchCampaignProgress({ userId, gameMode })

  // Only write if this is a new high score
  const currentHighest = existing?.highest_level ?? 0;
  if (level <= currentHighest) {
    return null; // no-op, existing record is already higher or equal
  }

  // Upsert new high score 
  const { data: upserted, error: upsertError } = await supabase
    .from("campaign_progress")
    .upsert(
      {
        user_id: userId,
        mode: gameMode,
        highest_level: level,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,mode",
      },
    )
    .select()
    .single();

  if (upsertError) {
    console.error("[updateCampaignProgress] upsert failed:", upsertError);
    throw new Error(
      `Failed to write campaign progress: ${upsertError.message}`,
    );
  }

  return upserted;
}