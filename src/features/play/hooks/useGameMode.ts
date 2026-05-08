import { useSearchParams } from "react-router";
import type { GameMode } from "@/globals/types/simon";

export default function useGameMode() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") ?? "classic") as GameMode;
  const goal = Number(searchParams.get("goal")) || 0;

  const config = {
    mode,
    goal,
    isEcho: mode === "echo",
    isStatic: mode === "static",
    // Logic to check if the current round results in a total game victory
    checkVictory: (currentLength: number) => {
      if (mode === "static" && goal > 0) {
        return currentLength === goal;
      }
      return false;
    }
  };

  return config;
}