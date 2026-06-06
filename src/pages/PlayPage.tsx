import { useState } from "react";
import { useNavigate } from "react-router";

// Feature Components
import GameHeader from "@/features/play/components/GameHeader";
import PauseMenu from "@/features/play/components/PauseMenu";
import HardwareModal from "@/features/play/components/HardwareModal";
import PlayNavigation from "@/features/play/components/PlayNavigation";
import GameConsole from "@/features/play/components/GameConsole";

// Hooks & Globals
import useSimonGame from "@/features/play/hooks/useSimonGame";
import Button from "@/globals/components/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { STATUS_CONFIG } from "@/features/play/constants";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import SettingsModal from "@/features/play/components/SettingsModal";
import { useMusic } from "@/features/audio/components/MusicProvider";
import GameResultOverlay from "@/features/play/components/GameResultOverlay";
import useArduinoInput from "@/features/controllers/hooks/useArduinoInput";
import useKeyboardInput from "@/features/controllers/hooks/useKeyboardInput";
import AchievementListModal from "@/features/achievements/components/AchievementListModal";

const PlayPage = () => {
  const game = useSimonGame();
  const { connect, status: connectionStatus } = useArduinoInput(
    game.handleInput,
  );
  useKeyboardInput(game.handleInput);
  const { fadeToVolume, getEffectiveVolume } = useMusic();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "menu" | "hardware" | "achievements" | null
  >(null);

  const openMenu = () => {
    setActiveModal("menu");
    game.setStatus((prev) => {
      const newState =
        prev === "playing" || prev === "sequence" ? "paused" : prev;

      // Fade to 20% volume wehen paused
      if (newState === "paused") fadeToVolume(0.2);

      return newState;
    });
  };

  const resumeGame = () => {
    setActiveModal(null);
    game.setStatus((prev) => {
      const newState = prev === "paused" ? "playing" : prev;

      if (newState === "playing") fadeToVolume(getEffectiveVolume());

      return newState;
    });
  };

  const saveAndQuit = () => {
    game.reset();
    setActiveModal(null);
    navigate("/mode");
  };

  const currentStatus = STATUS_CONFIG[game.status];
  const isConnected = connectionStatus === "connected";

  return (
    <PageWrapper className="relative flex flex-col items-center justify-center pb-24">
      <PlayNavigation
        isConnected={isConnected}
        onOpenMenu={openMenu}
        onOpenHardware={() => setActiveModal("hardware")}
      />

      <div className="relative w-full max-w-md mt-12 flex flex-col items-center gap-10">
        <div className="px-2">
          <GameHeader
            level={
              game.mode === "burst" || game.mode === "timeattack"
                ? game.inputs.length
                : game.level
            }
            currentStatus={currentStatus}
            sequence={game.sequence}
            inputsLength={game.inputs.length}
            mode={game.mode}
          />
        </div>

        <GameConsole
          buttons={game.currentButtons}
          mode={game.mode}
          activeButton={game.activeButton}
          isButtonDisabled={game.status !== "playing"}
          onInput={game.handleInput}
          showBegin={game.showBegin}
        />

        <div className="flex items-center justify-center gap-4">
          {game.status === "not-started" ? (
            <Button
              text="Start Sequence"
              onClick={game.startGame}
              onMouseEnter={() => sfxPlayer.play(SFX.BTN_HOVER)}
              onTouchStart={() => sfxPlayer.play(SFX.BTN_HOVER)}
            />
          ) : (
            <Button
              text="Reset System"
              variant="danger"
              onClick={game.reset}
              onMouseEnter={() => sfxPlayer.play(SFX.BTN_HOVER)}
              onTouchStart={() => sfxPlayer.play(SFX.BTN_HOVER)}
            />
          )}
        </div>
      </div>

      <HardwareModal
        isOpen={activeModal === "hardware"}
        onClose={() => setActiveModal(null)}
        status={connectionStatus}
        onConnect={connect}
      />

      <PauseMenu
        isOpen={activeModal === "menu"}
        isConnected={isConnected}
        onRetry={() => {
          game.reset();
          setActiveModal(null);
        }}
        onResume={resumeGame}
        onQuit={saveAndQuit}
        onSettingsOpen={() => {
          sfxPlayer.play(SFX.SHOW_MODAL);
          setIsSettingsOpen(true);
        }}
        onAchievementsOpen={() => {
          sfxPlayer.play(SFX.SHOW_MODAL);
          setAchievementsOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AchievementListModal
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />

      {(game.status === "victory" || game.status === "lose") &&
        game.timeTaken !== null && (
          <GameResultOverlay
            variant={game.status}
            mode={game.mode}
            level={game.level}
            goal={game.goal}
            timeTaken={game.timeTaken ?? undefined}
            isEndless={game.isEndless}
            avgReactionTime={game.avgReactionTime}
            onRetry={game.reset}
          />
        )}
    </PageWrapper>
  );
};

export default PlayPage;
