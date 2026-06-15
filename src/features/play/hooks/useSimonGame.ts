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
import { updateCampaignProgress } from "@/features/campaign/services/campaignService";
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

  const handleInput = useCallback(
    async (type: InputType, input: SimonButtonType) => {
      if (statusRef.current !== "playing") return;

      analytics.recordInputType(type);

      if (input === core.sequence[core.inputs.length]) {
        analytics.recordSuccessfulInput();
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
        analytics.recordFailure(nextIndex);
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

        emitter.emit("game_completed", {
          level: config.hasGoal ? core.inputs.length : core.level - 1,
          mode: config.mode,
          won: false,
          timeTakenMs: gameDuration,
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
              : // core.level represents the completedLevel
                // because level is incremented at the start of the next round
                core.level,
            goal: config.goal,
            inputs: core.inputs,
            timeTaken: gameDuration,
          });
        }
        return;
      }

      const newInputs = [...core.inputs, input];
      core.setInputs(newInputs);

      // Check for Round Win / Victory
      if (newInputs.length === core.sequence.length) {
        analytics.completeRound();

        if (config.checkVictory(core.sequence.length)) {
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
          await sfxPlayer.play(SFX.AWESOME);
          musicPlayer.play(MUSIC.GAMEFINISHED);

          core.setStatus("victory");

          emitter.emit("game_completed", {
            level: core.level,
            mode: config.mode,
            won: true,
            timeTakenMs: gameDuration,
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
              timeTaken: gameDuration,
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
      analytics,
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

  const startGame = async () => {
    if (config.isCampaign && isCampaignLoading) return;
    if (hasStartedGameRef.current) return;
    hasStartedGameRef.current = true;

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
