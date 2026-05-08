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

const PlayPage = () => {
  const game = useSimonGame();
  const { connect, status: connectionStatus } = useArduinoInput(
    game.handleInput,
  );
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);

  const openMenu = () => {
    setIsMenuOpen(true);
    game.setStatus((prev) =>
      prev === "playing" || prev === "sequence" ? "paused" : prev,
    );
  };

  const resumeGame = () => {
    setIsMenuOpen(false);
    game.setStatus((prev) => (prev === "paused" ? "playing" : prev));
  };

  const saveAndQuit = () => {
    game.reset();
    setIsMenuOpen(false);
    navigate("/");
  };

  const currentStatus = STATUS_CONFIG[game.status];
  const isConnected = connectionStatus === "connected";

  return (
    <PageWrapper className="relative flex flex-col items-center justify-center pb-20">
      <PlayNavigation
        isConnected={isConnected}
        onOpenMenu={openMenu}
        onOpenHardware={() => setIsHardwareModalOpen(true)}
      />

      <div className="relative w-full max-w-md mt-12 flex flex-col items-center gap-10">
        <div className="px-2">
          <GameHeader
            level={game.level}
            currentStatus={currentStatus}
            sequenceLength={game.sequence.length}
            inputsLength={game.inputs.length}
          />
        </div>

        <GameConsole
          activeButton={game.activeButton}
          isButtonDisabled={game.status !== "playing"}
          onInput={game.handleInput}
        />

        <div className="flex items-center justify-center gap-4">
          {game.status === "not-started" ? (
            <Button text="Start Sequence" onClick={game.startGame} size="sm" />
          ) : (
            <Button
              text="Reset System"
              size="sm"
              variant="danger"
              onClick={game.reset}
            />
          )}
        </div>
      </div>

      <HardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        status={connectionStatus}
        onConnect={connect}
      />

      <PauseMenu
        isOpen={isMenuOpen}
        isConnected={isConnected}
        onRetry={() => {
          game.reset();
          setIsMenuOpen(false);
        }}
        onResume={resumeGame}
        onQuit={saveAndQuit}
      />
    </PageWrapper>
  );
};

export default PlayPage;
