import { SFX } from "@/features/audio/constants/sfx";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import type { GameMode, SimonButtonType } from "@/globals/types/simon";
import { delay } from "@/globals/utils";
import { useCallback, useState } from "react";

type Params = {
  simonButtons: SimonButtonType[];
  stopMusic: () => Promise<void>;
  playColor: (color: SimonButtonType, mode: GameMode) => void;
  gameMode: GameMode;
  onActiveButtonChange: (button: SimonButtonType | null) => void;
};

export default function useGameIntro({
  simonButtons,
  stopMusic,
  playColor,
  gameMode,
  onActiveButtonChange,
}: Params) {
  const [showBegin, setShowBegin] = useState(false);

  const play = useCallback(async () => {
    document.documentElement.requestFullscreen();
    await stopMusic();
    await delay(500);

    const buttons = [...simonButtons];
    // Flash all buttons in a spiral
    const sequence = [...buttons, ...[...buttons].reverse()];
    for await (const b of sequence) {
      onActiveButtonChange(b);
      playColor(b, gameMode);

      await delay(100);
      onActiveButtonChange(null);
    }

    sfxPlayer.play(SFX.BEGIN, { volume: 1 });
    setShowBegin(true);
    await delay(1000);

    setShowBegin(false);
  }, [stopMusic, onActiveButtonChange, playColor, gameMode, simonButtons]);

  return {
    play,
    showBegin,
  };
}
