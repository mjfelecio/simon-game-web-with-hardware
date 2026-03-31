import type { GameState, SimonButtonType } from "@/globals/types/simon";

export const BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export const STATUS_CONFIG: Record<GameState, { label: string; color: string }> = {
  "not-started": { label: "Ready?", color: "text-slate-200" },
  sequence: { label: "Watch!", color: "text-yellow-400" },
  playing: { label: "Your Turn", color: "text-green-400" },
  won: { label: "Nice!", color: "text-blue-400" },
  lose: { label: "Game Over", color: "text-red-500" },
  paused: { label: "Paused", color: "text-gray-400" },
};