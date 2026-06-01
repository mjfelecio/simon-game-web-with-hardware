import { supabase } from "@/globals/libs/db";
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/globals/types/database";
import type { ScoreView } from "@/globals/types/simon";
import { getLeaderboardType } from "@/features/leaderboard/constants";

export type Score = Tables<"scores">;
export type ScoreInsert = TablesInsert<"scores">;
export type ScoreUpdate = TablesUpdate<"scores">;

export const mapScore = (
  s: Score & { users: { username: string } },
): ScoreView => ({
  ...s,
  username: s.users.username ?? null,
});

/**
 * Create a new score entry.
 */
export const createScore = async (score: ScoreInsert): Promise<Score> => {
  const { data, error } = await supabase
    .from("scores")
    .insert(score)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch a score by its primary key.
 */
export const getScoreById = async (id: number): Promise<Score | null> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*, users(username)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapScore(data) : null;
};

/**
 * Fetch all scores.
 */
export const getScores = async () => {
  const { data, error } = await supabase
    .from("scores")
    .select("*, users(username)")
    .order("score", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapScore);
};

/**
 * Fetch top scores for a specific game mode.
 */
export const getTopScoresByGameMode = async (
  gamemode: string,
  limit = 10,
): Promise<Score[]> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*, users(username)")
    .eq("gamemode", gamemode)
    .order("level", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data.map(mapScore);
};

/**
 * Fetch all scores submitted by a user.
 */
export const getScoresByUserId = async (userId: string): Promise<Score[]> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*, users(username)")
    .eq("user_id", userId)
    .order("level", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapScore);
};

export const getLeaderboard = async (filters?: {
  gamemode?: string;
  input_type?: string;
  goal?: number;
  limit?: number;
}) => {
  const leaderboardType = getLeaderboardType(filters?.gamemode);

  let query = supabase.from("scores").select("*, users(username)");

  if (filters?.gamemode) {
    query = query.eq("gamemode", filters.gamemode);
  }

  if (filters?.input_type) {
    query = query.ilike("input_type", filters.input_type);
  }

  if (filters?.goal) {
    query = query.eq("goal", filters.goal);
  }

  if (leaderboardType === "speed") {
    query = query
      .not("time_taken", "is", null)
      .order("time_taken", { ascending: true });
  } else {
    query = query
      .order("level", { ascending: false })
      .order("time_taken", { ascending: true });
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(mapScore);
};

/**
 * Update an existing score.
 */
export const updateScore = async (
  id: number,
  updates: ScoreUpdate,
): Promise<Score> => {
  const { data, error } = await supabase
    .from("scores")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Delete a score by ID.
 */
export const deleteScore = async (id: number): Promise<void> => {
  const { error } = await supabase.from("scores").delete().eq("id", id);

  if (error) {
    throw error;
  }
};

/**
 * Insert a score and return whether it is a new personal best.
 */
export const submitScore = async (
  score: ScoreInsert,
): Promise<{
  score: Score;
  isPersonalBest: boolean;
}> => {
  const leaderboardType = getLeaderboardType(score.gamemode);

  const { data: bestScore } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", score.user_id)
    .eq("gamemode", score.gamemode)
    .eq("input_type", score.input_type)
    .eq("goal", score.goal ?? 0)
    .limit(1)
    .maybeSingle();

  const createdScore = await createScore(score);

  let isPersonalBest = false;

  if (!bestScore) {
    isPersonalBest = true;
  } else if (leaderboardType === "speed") {
    isPersonalBest =
      createdScore.time_taken != null &&
      bestScore.time_taken != null &&
      createdScore.time_taken < bestScore.time_taken;
  } else {
    isPersonalBest = createdScore.level > bestScore.level;
  }
  return {
    score: createdScore,
    isPersonalBest,
  };
};
