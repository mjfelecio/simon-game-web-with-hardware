import type { GameState, SimonButtonType } from "@/globals/types/simon";

export const STATUS_CONFIG: Record<GameState, { label: string; color: string }> = {
  "not-started": { label: "Ready?", color: "text-slate-200" },
  sequence: { label: "Watch!", color: "text-yellow-400" },
  playing: { label: "Your Turn", color: "text-green-400" },
  won: { label: "Nice!", color: "text-blue-400" },
  lose: { label: "Game Over", color: "text-red-500" },
  paused: { label: "Paused", color: "text-gray-400" },
  victory: { label: "You won!", color: "text-blue-400" },
};

export const BUTTON_COLOR: Record<SimonButtonType, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
};

export const GLOW_COLOR: Record<SimonButtonType, string> = {
  red: "shadow-[0_0_40px_rgba(239,68,68,0.6)]",
  green: "shadow-[0_0_40px_rgba(34,197,94,0.6)]",
  blue: "shadow-[0_0_40px_rgba(59,130,246,0.6)]",
  yellow: "shadow-[0_0_40px_rgba(250,204,21,0.6)]",
};