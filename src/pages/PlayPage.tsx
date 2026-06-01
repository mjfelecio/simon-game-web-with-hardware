import { useState } from "react";
import { useNavigate } from "react-router";

// Feature Components
import GameHeader from "@/features/play/components/GameHeader";
import PauseMenu from "@/features/play/components/PauseMenu";
import HardwareModal from "@/features/play/components/HardwareModal";
import PlayNavigation from "@/features/play/components/PlayNavigation";
import GameConsole from "@/features/play/components/GameConsole";

// Hooks & Globals
import useArduinoInput from "@/features/play/hooks/useArduinoInput";
import useSimonGame from "@/features/play/hooks/useSimonGame";
import Button from "@/globals/components/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { STATUS_CONFIG } from "@/features/play/constants";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import SettingsModal from "@/features/play/components/SettingsModal";
import GameResultOverlay from "@/features/play/components/GameResultOverlay";

const PlayPage = () => {
  const game = useSimonGame();
  const { connect, status: connectionStatus } = useArduinoInput(
    game.handleInput,
  );
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"menu" | "hardware" | null>(
    null,
  );

  const openMenu = () => {
    setActiveModal("menu");
    game.setStatus((prev) =>
      prev === "playing" || prev === "sequence" ? "paused" : prev,
    );
  };

  const resumeGame = () => {
    setActiveModal(null);
    game.setStatus((prev) => (prev === "paused" ? "playing" : prev));
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
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
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
