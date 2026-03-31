import GameHeader from "@/features/play/components/GameHeader";
import PauseMenu from "@/features/play/components/PauseMenu";
import SimonButton from "@/features/play/components/SimonButton";
import { BUTTONS, STATUS_CONFIG } from "@/features/play/constants";
import useArduinoInput from "@/features/play/hooks/useArduinoInput";
import useSimonGame from "@/features/play/hooks/useSimonGame";
import Button from "@/globals/components/layouts/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import HardwareModal from "@/features/play/components/HardwareModal";

const PlayPage = () => {
  const game = useSimonGame();
  const { connect, isConnected } = useArduinoInput(game.handleInput);
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
  const isButtonDisabled = game.status !== "playing";

  return (
    <PageWrapper className="relative pb-32">
      {/* Back Button */}
      <button
        onClick={openMenu}
        className="fixed top-4 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        ←
      </button>

      <button
        onClick={() => setIsHardwareModalOpen(true)}
        className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-md transition-all",
          isConnected
            ? "border-green-500/30 bg-green-500/10 text-green-500"
            : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
        )}
      >
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isConnected ? "bg-green-500" : "bg-white/20",
          )}
        />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {isConnected ? "Controller Active" : "Setup Controller"}
        </span>
      </button>

      <GameHeader
        level={game.level}
        currentStatus={currentStatus}
        sequenceLength={game.sequence.length}
        inputsLength={game.inputs.length}
      />

      {/* Main Game Grid */}
      <div className="grid grid-cols-2 gap-4">
        {BUTTONS.map((t) => (
          <SimonButton
            key={t}
            type={t}
            isDisabled={isButtonDisabled}
            isActive={game.activeSequence === t}
            onClick={game.handleInput}
          />
        ))}
      </div>

      {/* Game Actions */}
      <div className="flex gap-4 mt-8 justify-center">
        <Button
          text="Start Game"
          onClick={game.startGame}
          disabled={game.status !== "not-started"}
          size="sm"
          fullWidth={false}
        />
        <Button
          text="Reset"
          variant="danger"
          size="sm"
          fullWidth={false}
          onClick={game.reset}
        />
      </div>

      {/* Modals */}
      <HardwareModal
        isOpen={isHardwareModalOpen}
        onClose={() => setIsHardwareModalOpen(false)}
        isConnected={isConnected}
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
