import { useCallback, useEffect, useRef, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { InputType, SimonButtonType } from "@/globals/types/simon";
import { toastError, toastWarning } from "@/globals/utils/toast";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { formatDuration } from "@/globals/utils/formatter";
import { musicPlayer } from "@/features/audio/utils/musicPlayer";
import useEventEmitter from "@/features/events/hooks/useEventEmitter";
import { updateCampaignProgress } from "@/features/campaign/services/campaignService";
import useCampaign from "./useCampaign";
import useScoreSubmission from "./useScoreSubmission";

export default function useSimonGame() {
  const emitter = useEventEmitter();
  const config = useGameMode();
  const { user } = useAuth();
  const { playMusic, stopMusic } = useMusic();
  const core = useSimonCore();
  const audio = useSimonAudio();
  const [activeButton, setActiveButton] = useState<SimonButtonType | null>(
    null,
  );
  const [showBegin, setShowBegin] = useState(false);

  const statusRef = useRef(core.status);
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

  const { isCampaignLoading, campaignProgressLevel } = useCampaign({
    gameMode: config.mode,
    isCampaign: config.isCampaign,
    userId: user?.id,
  });

  const { mutateAsync: submitGameScore } = useScoreSubmission({
    userId: user?.id,
    inputsUsed: inputsUsed,
  });

  useEffect(() => {
    if (config.isCampaign && core.status === "not-started") {
      core.setLevel(campaignProgressLevel + 1);
    }
  }, [core, config.isCampaign, campaignProgressLevel]);

  useEffect(() => {
    statusRef.current = core.status;
  }, [core.status]);

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

  const handleInput = useCallback(
    async (type: InputType, input: SimonButtonType) => {
      if (statusRef.current !== "playing") return;

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

      const timeTaken =
        startedAtRef.current != null
          ? Math.round(performance.now() - startedAtRef.current)
          : undefined;

      // Check for Loss
      if (input !== core.sequence[nextIndex]) {
        core.setStatus("lose");

        // SFX for losing
        await stopMusic();
        await audio.playLoseTone();
        musicPlayer.play(MUSIC.GAMEFINISHED);

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

        emitter.emit("game_completed", {
          level: config.hasGoal ? core.inputs.length : core.level - 1,
          mode: config.mode,
          won: false,
          timeTakenMs: timeTaken,
        });

        if (config.isCampaign && user?.id) {
          // TODO: Use the game_completed signal to handle this elsewhere
          await updateCampaignProgress({
            userId: user.id,
            gameMode: config.mode,
            level: core.level - 1,
          });
        } else {
          await submitGameScore({
            gameMode: config.mode,
            completedLevel: config.hasGoal
              ? core.inputs.length
              // core.level represents the completedLevel
              // because level is incremented at the start of the next round
              : core.level,
            goal: config.goal,
            inputs: core.inputs,
            timeTaken: timeTaken,
          });
        }
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

          if (!timeTaken) {
            toastError("Error", { description: "Time taken was not recorded" });
            return;
          }

          setTimeTaken(timeTaken);

          emitter.emit("game_completed", {
            level: core.level,
            mode: config.mode,
            won: true,
            timeTakenMs: timeTaken,
          });

          // TODO: Use the game_completed signal to handle this elsewhere
          if (config.isCampaign && user?.id) {
            await updateCampaignProgress({
              userId: user.id,
              gameMode: config.mode,
              level: core.level,
            });
          } else {
            await submitGameScore({
              gameMode: config.mode,
              completedLevel: config.hasGoal
                ? core.inputs.length
                : core.level - 1,
              goal: config.goal,
              inputs: core.inputs,
              timeTaken: timeTaken,
            });
          }
        } else {
          core.setStatus("won");

          // No delays when in timeattack mode
          if (config.mode !== "timeattack") await delay(400);
          audio.playWinMelody();
          if (config.mode !== "timeattack") await delay(1000);

          const nextSeq = core.generateNextSequence(core.sequence);
          core.setSequence(nextSeq);
          const nextLevel = core.level + 1;

          core.setLevel(nextLevel);

          // Shuffle buttons if in entropy mode
          if (config.mode === "entropy") core.shuffleButtons();

          playSequence(nextSeq);

          emitter.emit("game_advance", {
            level: nextLevel,
            mode: config.mode,
            timeTakenMs: timeTaken,
          });
        }
      }
    },
    [
      core,
      config,
      audio,
      stopMusic,
      playSequence,
      submitGameScore,
      emitter,
      user?.id,
    ],
  );

  const resetGame = () => {
    playMusic(MUSIC.BG);
    core.resetGame();
    if (config.isCampaign) {
      core.setLevel(campaignProgressLevel);
    }
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
    setShowBegin(true);
    await delay(1000);

    setShowBegin(false);
  };

  const startGame = async () => {
    if (config.isCampaign && isCampaignLoading) return;

    if (hasStartedGameRef.current) return;

    // lock this shit
    hasStartedGameRef.current = true;

    await startingSequence();

    if (config.mode !== "echo") {
      playMusic(MUSIC.GAMEPLAY);
    }

    const startSeq = config.hasGoal
      ? core.generateSequence(config.goal)
      : config.isCampaign
        ? core.generateSequence(campaignProgressLevel + 1)
        : core.generateNextSequence([]);

    core.setSequence(startSeq);

    if (config.isCampaign) {
      core.setLevel(campaignProgressLevel + 1);
    } else {
      core.setLevel(1);
    }

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
    showBegin,
  };
}
