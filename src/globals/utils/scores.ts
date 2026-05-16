import { supabase } from "@/globals/libs/db";
import type { Tables, TablesInsert, TablesUpdate } from "@/globals/types/database";

export type Score = Tables<"scores">;
export type ScoreInsert = TablesInsert<"scores">;
export type ScoreUpdate = TablesUpdate<"scores">;

/**
 * Create a new score entry.
 */
export const createScore = async (
  score: ScoreInsert,
): Promise<Score> => {
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
export const getScoreById = async (
  id: number,
): Promise<Score | null> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch all scores.
 */
export const getScores = async (): Promise<Score[]> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
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
    .select("*")
    .eq("gamemode", gamemode)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch all scores submitted by a user.
 */
export const getScoresByUserId = async (
  userId: number,
): Promise<Score[]> => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("score", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Fetch top scores for a specific game mode and input type.
 */
export const getLeaderboard = async ({
  gamemode,
  inputType,
  limit = 10,
}: {
  gamemode?: string;
  inputType?: string;
  limit?: number;
}): Promise<Score[]> => {
  let query = supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (gamemode) {
    query = query.eq("gamemode", gamemode);
  }

  if (inputType) {
    query = query.eq("input_type", inputType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
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
  const { error } = await supabase
    .from("scores")
    .delete()
    .eq("id", id);

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
  const { data: bestScore } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", score.user_id)
    .eq("gamemode", score.gamemode)
    .eq("input_type", score.input_type)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle();

  const createdScore = await createScore(score);

  const isPersonalBest =
    !bestScore || createdScore.score > bestScore.score;

  return {
    score: createdScore,
    isPersonalBest,
  };
};