import { useCallback, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { SimonButtonType } from "@/globals/types/simon";
import { submitScore } from "@/globals/utils/scores";
import { getStoredUser } from "@/features/auth/utils/auth";

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

      // Only play the newly appended sequence if in fragment gamemode
      const seqToPlay =
        config.mode === "fragment" ? [seq[seq.length - 1]] : seq;

      for (const color of seqToPlay) {
        // Don't light up the button when its echo mode
        if (config.mode !== "echo") setActiveButton(color);
        await audio.playColor(color, config.mode);
        setActiveButton(null);
        await delay(config.mode === "blitz" ? 100 : 200);
      }

      core.setInputs([]);
      core.setStatus("playing");
    },
    [config.mode, audio, core],
  );

  const handleInput = useCallback(
    async (input: SimonButtonType) => {
      if (core.status !== "playing") return;

      setActiveButton(input);
      audio.playColor(input, config.mode);
      setTimeout(
        () => setActiveButton(null),
        config.mode === "blitz" ? 100 : 200,
      );

      const nextIndex = core.inputs.length;

      // Check for Loss
      if (input !== core.sequence[nextIndex]) {
        core.setStatus("lose");
        await delay(1000);
        audio.playLoseDissonance();

        const user = getStoredUser();

        if (!user) {
          alert("Please login to submit your scores.");
          console.warn("Score submission failed: User is not logged in.");
          return;
        }

        // Retry until success or all retry attempts exhausted
        let retry_attempts = 3; 
        let shouldRetry = true;

        while (shouldRetry && retry_attempts !== 0) {
          try {
            await submitScore({
              user_id: user.id,
              gamemode: config.mode,
              input_type: "mouse",
              score: core.level,
            });

            // Success, stop retrying
            shouldRetry = false;
          } catch (error) {
            retry_attempts--;

            if (error instanceof Error) {
              console.error("Score submission failed:", error.message);
            } else {
              console.error("Failed to submit score due to an unknown error \n", error);
            }

            shouldRetry = confirm(
              "Failed to submit score. Would you like to retry?",
            );
          }
        }

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

          // Shuffle buttons if in entropy mode
          if (config.mode === "entropy") core.shuffleButtons();

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
