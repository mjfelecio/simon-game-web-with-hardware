import { useCallback } from "react";
import {
  BUTTON_FREQUENCIES,
  playTone,
  playWinMelody,
  playLoseTone,
  playVictoryTone
} from "@/features/audio/utils/simonTones";
import type { GameMode, SimonButtonType } from "@/globals/types/simon";
import { delay } from "@/globals/utils";

export default function useSimonAudio() {
  const playColor = useCallback(
    async (color: SimonButtonType, mode: GameMode) => {
      const freq = BUTTON_FREQUENCIES[color];

      if (mode === "echo") {
        // Echo Mode
        playTone(freq, { type: "square", duration: 0.6 });
        await delay(600); // Wait for the full sound in Echo mode
      } else if (mode === "blitz") {
        playTone(freq, { type: "square", duration: 0.2 });
        await delay(100);
      } else {
        // Normal Mode: Punchy "Square" wave for that retro arcade feel
        playTone(freq, { type: "square", duration: 0.2 });
        await delay(200);
      }
    },
    [],
  );

  return {
    playColor,
    playWinMelody,
    playVictoryTone,
    playLoseTone
  };
}
