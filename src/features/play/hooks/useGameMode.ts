import { useSearchParams } from "react-router";
import type { GameMode } from "@/globals/types/simon";

export const ENDLESS_MODES = new Set<GameMode>([
  "classic",
  "blitz",
  "echo",
  "entropy",
  "fragment",
  "ghost", 
]);

export default function useGameMode() {
  const [searchParams] = useSearchParams();

  const mode = (searchParams.get("mode") ?? "classic") as GameMode;
  const goal = Number(searchParams.get("goal")) || 0;
  const isCampaign = Boolean(searchParams.get("campaign"));

  const hasGoal = mode === "burst"  || mode === "timeattack"
  const isEndless = ENDLESS_MODES.has(mode);

  const config = {
    mode,
    goal,
    isEcho: mode === "echo",
    isBurst: mode === "burst",
    isEndless,
    hasGoal,
    isCampaign,
    // Logic to check if the current round results in a total game victory
    checkVictory: (currentLength: number) => {
      if (hasGoal && goal > 0) {
        return currentLength === goal;
      }
      return false;
    }
  };

  return config;
}