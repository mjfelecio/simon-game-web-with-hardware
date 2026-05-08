import { useCallback } from "react";
import {
  BUTTON_FREQUENCIES,
  playTone,
  playWinMelody,
  playLoseDissonance,
} from "@/globals/utils/audio";
import type { SimonButtonType } from "@/globals/types/simon";
import { delay } from "@/globals/utils";

export default function useSimonAudio() {
  const playColor = useCallback(
    async (color: SimonButtonType, duration = 200) => {
      playTone(BUTTON_FREQUENCIES[color]);
      await delay(duration);
    },
    [],
  );

  return { playColor, playWinMelody, playLoseDissonance };
}
