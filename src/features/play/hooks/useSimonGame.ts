import { useCallback, useEffect, useRef, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { InputType, SimonButtonType } from "@/globals/types/simon";
import { submitScore } from "@/globals/utils/scores";
import {
  toastError,
  toastInfo,
  toastPromise,
  toastWarning,
} from "@/globals/utils/toast";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { formatDuration } from "@/globals/utils/formatter";
import { musicPlayer } from "@/features/audio/utils/musicPlayer";

export default function useSimonGame() {
  const config = useGameMode();
  const { user } = useAuth();
  const { playMusic, stopMusic } = useMusic();
  const core = useSimonCore();
  const audio = useSimonAudio();
  const [activeButton, setActiveButton] = useState<SimonButtonType | null>(
    null,
  );
  const hasStartedGameRef = useRef(false);
  const inputsUsed = useRef<Set<InputType>>(new Set());

  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);

  // Reaction time
  const reactionTimesRef = useRef<number[]>([]);
  const lastPromptAtRef = useRef<number | null>(null);

  const avgReactionTime =
    reactionTimesRef.current.length > 0
      ? Math.round(
          reactionTimesRef.current.reduce((a, b) => a + b, 0) /
            reactionTimesRef.current.length,
        )
      : null;

  const playSequence = useCallback(
    async (seq: SimonButtonType[]) => {
      // If in timeattack, we don 't play the sequence, we just show it directly
      // on the UI so that its purely reaction based.
      if (config.mode === "timeattack") {
        core.setInputs([]);
        core.setStatus("playing");
        lastPromptAtRef.current = performance.now();
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
      lastPromptAtRef.current = performance.now();
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

      if (config.mode === "timeattack")
        toastInfo(`Time taken: ${formattedTime}`);

      // level depends on burst
      const level = config.isBurst ? inputs.length : core.level;

      const hasGoal = config.mode === "burst" || config.mode === "timeattack";
      const goal = hasGoal ? config.goal : undefined;

      // Stored as CSV in string form
      const inputType = Array.from(inputsUsed.current).join(",");

      let retryAttempts = 3;

      const executeSubmission = async (): Promise<void> => {
        try {
          await submitScore({
            user_id: user.id,
            gamemode: config.mode,
            input_type: inputType,
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
    async (type: InputType, input: SimonButtonType) => {
      if (core.status !== "playing") return;

      alert(type)

      // Recording the input type
      if (!inputsUsed.current.has(type)) {
        inputsUsed.current.add(type);
      }

      // Reaction time only on correct inputs
      if (
        lastPromptAtRef.current != null &&
        input === core.sequence[core.inputs.length]
      ) {
        reactionTimesRef.current.push(
          performance.now() - lastPromptAtRef.current,
        );
        lastPromptAtRef.current = performance.now();
      }

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

        // SFX for losing
        await stopMusic();
        await audio.playLoseTone();
        musicPlayer.play(MUSIC.GAMEFINISHED);

        const timeTaken =
          startedAtRef.current != null
            ? Math.round(performance.now() - startedAtRef.current)
            : undefined;

        if (!timeTaken) {
          toastError("Error", { description: "Time taken was not recorded" });
          return;
        }

        setTimeTaken(timeTaken);
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
          // PLay victory music

          await stopMusic();
          await audio.playVictoryTone();
          await sfxPlayer.play(SFX.AWESOME);
          musicPlayer.play(MUSIC.GAMEFINISHED);

          core.setStatus("victory");

          const timeTaken =
            startedAtRef.current != null
              ? Math.round(performance.now() - startedAtRef.current)
              : undefined;

          if (!timeTaken) {
            toastError("Error", { description: "Time taken was not recorded" });
            return;
          }

          setTimeTaken(timeTaken);
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
    [core, config, audio, stopMusic, playSequence, submitScoreWithRetry],
  );

  const resetGame = () => {
    playMusic(MUSIC.BG);
    core.resetGame();
    hasStartedGameRef.current = false;
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
    if (hasStartedGameRef.current) return;

    // lock this shit
    hasStartedGameRef.current = true;

    await startingSequence();

    if (config.mode !== "echo") {
      playMusic(MUSIC.GAMEPLAY);
    }

    const startSeq = config.hasGoal
      ? core.generateSequence(config.goal)
      : core.generateNextSequence([]);

    core.setSequence(startSeq);
    core.setLevel(1);

    // Timer starts when the sequence is set
    setTimeTaken(null);
    startedAtRef.current = performance.now();

    // Reset refs
    reactionTimesRef.current = [];
    lastPromptAtRef.current = null;
    inputsUsed.current = new Set();

    playSequence(startSeq);
  };

  useEffect(() => {
    return () => void playMusic(MUSIC.BG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...core,
    ...config,
    activeButton,
    startGame,
    handleInput,
    reset: resetGame,
    mode: config.mode,
    timeTaken,
    avgReactionTime,
  };
}
