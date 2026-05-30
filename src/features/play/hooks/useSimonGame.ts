import { useCallback, useEffect, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { SimonButtonType } from "@/globals/types/simon";
import { submitScore } from "@/globals/utils/scores";
import { toastPromise, toastWarning } from "@/globals/utils/toast";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { useAuth } from "@/features/auth/components/AuthProvider";

export default function useSimonGame() {
  const config = useGameMode();
  const { user } = useAuth();
  const { playMusic } = useMusic();
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

  const submitScoreWithRetry = useCallback(async () => {
    if (!user) {
      toastWarning("Score discarded", {
        description: "Please login to submit your score.",
      });

      return;
    }

    let retryAttempts = 3;

    const executeSubmission = async (): Promise<void> => {
      try {
        await submitScore({
          user_id: user.id,
          gamemode: config.mode,
          input_type: "mouse",
          level: core.level,
        });
      } catch (error) {
        retryAttempts--;

        if (retryAttempts <= 0) {
          throw error;
        }

        return executeSubmission();
      }
    };

    await toastPromise(executeSubmission(), {
      loading: {
        title: "Submitting score...",
        description: "Syncing with leaderboard",
      },

      success: {
        title: "Score submitted",
        description: `Reached level ${core.level}`,
      },

      error: {
        title: "Submission failed",
        description: "Could not sync your score.",
        action: {
          label: "Retry",
          onClick: () => {
            submitScoreWithRetry();
          },
        },
      },
    });
  }, [config.mode, core.level]);

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

        await submitScoreWithRetry();

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
    [core, config, audio, playSequence, submitScoreWithRetry],
  );

  const resetGame = () => {
    playMusic(MUSIC.BG, { volume: 0.1, loop: true });
    core.resetGame();
  };

  const startGame = async () => {
    playMusic(MUSIC.GAMEPLAY, { volume: 1, loop: true });

    await delay(1000);

    const startSeq = core.generateNextSequence([]);
    core.setSequence(startSeq);
    core.setLevel(1);
    playSequence(startSeq);
  };

  useEffect(() => {
    return () => void playMusic(MUSIC.BG, { volume: 0.1, loop: true });
  }, [playMusic]);

  return {
    ...core,
    activeButton,
    startGame,
    handleInput,
    reset: resetGame,
    mode: config.mode,
  };
}
