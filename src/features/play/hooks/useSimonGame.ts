import { useCallback, useEffect, useRef, useState } from "react";
import { delay } from "@/globals/utils";
import useGameMode from "./useGameMode";
import useSimonCore from "./useSimonCore";
import useSimonAudio from "./useSimonAudio";
import type { InputType, SimonButtonType } from "@/globals/types/simon";
import { toastError } from "@/globals/utils/toast";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { musicPlayer } from "@/features/audio/utils/musicPlayer";
import useEventEmitter from "@/features/events/hooks/useEventEmitter";
import useCampaign from "./useCampaign";
import useScoreSubmission from "./useScoreSubmission";
import useGameAnalytics from "./useGameAnalytics";
import useGameIntro from "./useGameIntro";

export default function useSimonGame() {
  const emitter = useEventEmitter();
  const config = useGameMode();
  const { user } = useAuth();
  const { playMusic, stopMusic } = useMusic();
  const core = useSimonCore();
  const audio = useSimonAudio();
  const analytics = useGameAnalytics();

  const [activeButton, setActiveButton] = useState<SimonButtonType | null>(
    null,
  );

  const statusRef = useRef(core.status);
  const hasStartedGameRef = useRef(false);
  const gameEndedRef = useRef(false);

  const intro = useGameIntro({
    simonButtons: core.currentButtons,
    stopMusic,
    playColor: audio.playColor,
    gameMode: config.mode,
    onActiveButtonChange: setActiveButton,
  });

  const { isCampaignLoading, campaignProgressLevel } = useCampaign({
    gameMode: config.mode,
    isCampaign: config.isCampaign,
    userId: user?.id,
  });

  const { mutateAsync: submitGameScore } = useScoreSubmission({
    userId: user?.id,
    inputsUsed: analytics.inputsUsed,
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
        analytics.startRound();
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
      analytics.startRound();
    },
    [analytics, config.mode, audio, core],
  );

  const handleLose = useCallback(async () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;

    const failPosition = core.inputs.length;

    analytics.recordFailure(failPosition);
    analytics.endGame();

    const gameDuration = analytics.getGameDuration();

    core.setStatus("lose");

    // SFX for losing
    await stopMusic();
    await audio.playLoseTone();
    musicPlayer.play(MUSIC.GAMEFINISHED);

    if (!gameDuration) {
      toastError("Error", {
        description: "Game duration was not recorded",
      });
      return;
    }

    // TODO: Rethink when and where to show the toast warning
    // const formattedTime = formatDuration(gameDuration);
    // if (config.mode === "timeattack") {
    //   toastWarning("Score discarded", {
    //     description: `Failing to reach goal in timeattack will not submit the score.
    //       Time: ${formattedTime}`,
    //   });
    //   return;
    // }

    emitter.emit("game_ended", {
      level: config.hasGoal ? core.inputs.length : core.level - 1,
      mode: config.mode,
      won: false,
      timeTakenMs: gameDuration,
      isCampaign: config.isCampaign,
    });

    if (!config.isCampaign) {
      await submitGameScore({
        gameMode: config.mode,
        completedLevel: config.hasGoal
          ? core.inputs.length
          : // core.level represents the completedLevel
            // because level is incremented at the start of the next round
            core.level,
        goal: config.goal,
        inputs: core.inputs,
        timeTaken: gameDuration,
      });
    }
  }, [analytics, stopMusic, audio, config, core, emitter, submitGameScore]);

  const handleVictory = useCallback(async () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;

    analytics.endGame();

    const gameDuration = analytics.getGameDuration();

    if (!gameDuration) {
      toastError("Error", {
        description: "Game duration was not recorded",
      });
      return;
    }

    // PLay victory music
    await stopMusic();
    await audio.playVictoryTone();
    sfxPlayer.play(SFX.AWESOME);
    musicPlayer.play(MUSIC.GAMEFINISHED);

    core.setStatus("victory");

    emitter.emit("game_ended", {
      level: core.level,
      mode: config.mode,
      won: true,
      timeTakenMs: gameDuration,
      isCampaign: config.isCampaign,
    });

    if (!config.isCampaign) {
      await submitGameScore({
        gameMode: config.mode,
        completedLevel: config.hasGoal ? core.inputs.length : core.level - 1,
        goal: config.goal,
        inputs: core.inputs,
        timeTaken: gameDuration,
      });
    }
  }, [core, analytics, audio, config, emitter, stopMusic, submitGameScore]);

  const proceedToNextLevel = useCallback(async () => {
    core.setStatus("won");

    // Play win melody
    if (config.mode !== "timeattack") await delay(400);
    audio.playWinMelody();
    if (config.mode !== "timeattack") await delay(1000);

    // Advance to next sequence and level
    const nextSeq = core.generateNextSequence(core.sequence);
    core.setSequence(nextSeq);
    const nextLevel = core.level + 1;
    core.setLevel(nextLevel);

    // Shuffle buttons if in entropy mode
    if (config.mode === "entropy") core.shuffleButtons();

    playSequence(nextSeq);

    emitter.emit("game_advance_to_next_level", {
      level: nextLevel,
      mode: config.mode,
      isCampaign: config.isCampaign,
    });
  }, [core, audio, config, emitter, playSequence]);

  const handleInput = useCallback(
    async (type: InputType, input: SimonButtonType) => {
      if (statusRef.current !== "playing") return;

      // Update inputs
      const newInputs = [...core.inputs, input];
      core.setInputs(newInputs);
      analytics.recordInputType(type);

      if (input === core.sequence[core.inputs.length]) {
        analytics.recordSuccessfulInput();
      }

      // Update active button and play color
      setActiveButton(input);
      audio.playColor(input, config.mode);
      await delay(config.mode === "blitz" ? 100 : 200);
      setActiveButton(null);

      const displayedButton = core.sequence[core.inputs.length];
      // Check if the input matches the displayed button
      const isLoss = input !== displayedButton;

      // Check for Loss and return early
      if (isLoss) {
        await handleLose();
        return;
      }

      const isSequenceComplete = newInputs.length === core.sequence.length;

      // Check for Round Win / Victory
      if (isSequenceComplete) {
        analytics.completeRound();

        // Handle victory and return early
        if (config.checkVictory(core.sequence.length)) {
          await handleVictory();
          return;
        }

        // Proceed to next level
        await proceedToNextLevel();
      }
    },
    [
      core,
      config,
      audio,
      analytics,
      handleLose,
      handleVictory,
      proceedToNextLevel,
    ],
  );

  const resetGame = () => {
    playMusic(MUSIC.BG);
    core.resetGame();
    if (config.isCampaign) {
      core.setLevel(campaignProgressLevel);
    }
    hasStartedGameRef.current = false;
    gameEndedRef.current = false;
  };

  const startGame = async () => {
    if (config.isCampaign && isCampaignLoading) return;
    if (hasStartedGameRef.current) return;
    hasStartedGameRef.current = true;
    gameEndedRef.current = false;

    await intro.play();

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

    // Reset analytics data for the new game
    analytics.startGame();
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
    timeTaken: analytics.getGameDuration(),
    avgReactionTime: analytics.getAverageInitialReactionTime(),
    showBegin: intro.showBegin,
  };
}
