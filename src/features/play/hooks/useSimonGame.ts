import { useCallback, useState } from "react";
import { db } from "@/globals/libs/db";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { SimonButtonType } from "@/globals/types/simon";

export default function useSimonGame() {
  const config = useGameMode();
  const core = useSimonCore();
  const audio = useSimonAudio();
  const [activeButton, setActiveButton] = useState<SimonButtonType | null>(
    null,
  );

  const playSequence = useCallback(
    async (seq: SimonButtonType[]) => {
      core.setStatus("sequence");
      await delay(200);

      for (const color of seq) {
        if (!config.isEcho) setActiveButton(color);
        await audio.playColor(color, config.isEcho);
        setActiveButton(null);
        await delay(200);
      }

      core.setInputs([]);
      core.setStatus("playing");
    },
    [config.isEcho, audio, core],
  );

  const handleInput = useCallback(
    async (input: SimonButtonType) => {
      if (core.status !== "playing") return;

      setActiveButton(input);
      audio.playColor(input, config.isEcho);
      setTimeout(() => setActiveButton(null), 200);

      const nextIndex = core.inputs.length;

      // Check for Loss
      if (input !== core.sequence[nextIndex]) {
        core.setStatus("lose");
        delay(1000);
        audio.playLoseDissonance();
        await db.scores.add({
          playerName: "KirbySmashYeet",
          score: core.level,
          level: core.level,
          mode: config.mode,
          achievedAt: Date.now(),
        });
        return;
      }

      const newInputs = [...core.inputs, input];
      core.setInputs(newInputs);

      // Check for Round Win / Victory
      if (newInputs.length === core.sequence.length) {
        if (config.checkVictory(core.sequence.length)) {
          core.setStatus("victory");
        } else {
          core.setStatus("won");
          await delay(400);
          audio.playWinMelody();
          await delay(1000);

          const nextSeq = core.generateNextSequence(core.sequence);
          core.setSequence(nextSeq);
          core.setLevel((prev) => prev + 1);
          playSequence(nextSeq);
        }
      }
    },
    [core, config, audio, playSequence],
  );

  const startGame = () => {
    const startSeq = core.generateNextSequence([]);
    core.setSequence(startSeq);
    core.setLevel(1);
    playSequence(startSeq);
  };

  return {
    ...core,
    activeButton,
    startGame,
    handleInput,
    reset: core.resetGame,
    mode: config.mode,
  };
}
