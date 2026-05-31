import { useCallback, useEffect, useRef, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { SimonButtonType } from "@/globals/types/simon";
import { submitScore } from "@/globals/utils/scores";
import { toastError, toastInfo, toastPromise, toastWarning } from "@/globals/utils/toast";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { formatDuration } from "@/globals/utils/formatter";

export default function useSimonGame() {
  const config = useGameMode();
  const { user } = useAuth();
  const { playMusic, stopMusic } = useMusic();
  const core = useSimonCore();
  const audio = useSimonAudio();
  const [activeButton, setActiveButton] = useState<SimonButtonType | null>(
    null,
  );
  const startedAtRef = useRef<number | null>(null);

  const playSequence = useCallback(
    async (seq: SimonButtonType[]) => {
      // If in timeattack, we don 't play the sequence, we just show it directly
      // on the UI so that its purely reaction based.
      if (config.mode === "timeattack") {
        core.setInputs([]);
        core.setStatus("playing");
        return;
      }

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

  const submitScoreWithRetry = useCallback(
    async (inputs: SimonButtonType[], timeTaken: number) => {
      if (!user) {
        toastWarning("Score discarded", {
          description: "Please login to submit your score.",
        });

        return;
      }

      const formattedTime = formatDuration(timeTaken);

      if (config.mode === "timeattack") toastInfo(`Time taken: ${formattedTime}`);

      // level depends on burst
      const level = config.isBurst ? inputs.length : core.level;

      const hasGoal = config.mode === "burst" || config.mode === "timeattack";
      const goal = hasGoal ? config.goal : undefined;

      let retryAttempts = 3;

      const executeSubmission = async (): Promise<void> => {
        try {
          await submitScore({
            user_id: user.id,
            gamemode: config.mode,
            input_type: "mouse",
            level: level,
            goal: goal,
            time_taken: timeTaken,
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
              submitScoreWithRetry(inputs, timeTaken);
            },
          },
        },
      });
    },
    [config.mode, config.goal, core.level, user, config.isBurst],
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

        const timeTaken =
          startedAtRef.current != null
            ? Math.round(performance.now() - startedAtRef.current)
            : undefined;

        if (!timeTaken) {
          toastError("Error", { description: "Time taken was not recorded" });
          return;
        }

        const formattedTime = formatDuration(timeTaken);
        if (config.mode === "timeattack") {
          toastWarning("Score discarded", {
            description: `Failing to reach goal in timeattack will not submit the score.
              Time: ${formattedTime}`,
          });
          return;
        }

        await submitScoreWithRetry(core.inputs, timeTaken);

        return;
      }

      const newInputs = [...core.inputs, input];
      core.setInputs(newInputs);

      // Check for Round Win / Victory
      if (newInputs.length === core.sequence.length) {
        if (config.checkVictory(core.sequence.length)) {
          core.setStatus("victory");

          const timeTaken =
            startedAtRef.current != null
              ? Math.round(performance.now() - startedAtRef.current)
              : undefined;

          if (!timeTaken) {
            toastError("Error", { description: "Time taken was not recorded" });
            return;
          }

          await submitScoreWithRetry(newInputs, timeTaken);
        } else {
          core.setStatus("won");

          // No delays when in timeattack mode
          if (config.mode !== "timeattack") await delay(400);
          audio.playWinMelody();
          if (config.mode !== "timeattack") await delay(1000);

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

  const startingSequence = async () => {
    document.documentElement.requestFullscreen();
    await stopMusic();
    await delay(500);

    const buttons = [...core.currentButtons];
    // Flash all buttons in a spiral
    const sequence = [...buttons, ...[...buttons].reverse()];
    for await (const b of sequence) {
      setActiveButton(b);
      audio.playColor(b, config.mode);

      await delay(100);
      setActiveButton(null);
    }

    sfxPlayer.play(SFX.BEGIN, { volume: 1 });
    await delay(1000);
  };

  const startGame = async () => {
    await startingSequence();

    if (config.mode !== "echo") {
      playMusic(MUSIC.GAMEPLAY, { loop: true });
    }

    const startSeq = config.hasGoal
      ? core.generateSequence(config.goal)
      : core.generateNextSequence([]);

    core.setSequence(startSeq);
    core.setLevel(1);

    // Timer starts when the sequence is set
    startedAtRef.current = performance.now();

    playSequence(startSeq);
  };

  useEffect(() => {
    return () => void playMusic(MUSIC.BG, { loop: true });
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
