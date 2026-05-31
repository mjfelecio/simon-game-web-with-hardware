import type { Tables } from "@/globals/types/database";

export type Score = Tables<"scores">
export type ScoreView = Score & { username: string }

export type GameMode =
  | "classic"
  | "echo"
  | "burst"
  | "blitz"
  | "fragment"
  | "entropy"
  | "ghost"
  | "timeattack";

export type InputType =
  | "mouse"
  | "keyboard"
  | "arduino"

export type GameState =
  | "not-started"
  | "sequence"
  | "playing"
  | "won"
  | "lose"
  | "paused"
  | "victory";

export type SimonButtonType = "red" | "green" | "blue" | "yellow";
