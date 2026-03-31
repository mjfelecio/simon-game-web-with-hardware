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

const PlayPage = () => {
  const game = useSimonGame();
  const { connect, isConnected } = useArduinoInput(game.handleInput);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <PageWrapper className="relative">
      <button
        onClick={openMenu}
        className="fixed top-4 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        ←
      </button>

      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 backdrop-blur-md">
        <div
          className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500"}`}
        />
        <span className="text-[10px] font-bold uppercase tracking-tighter text-white/50">
          {isConnected ? "Controller Active" : "No Controller"}
        </span>
      </div>

      {isMenuOpen && (
        <PauseMenu
          onRetry={() => {
            game.reset();
            setIsMenuOpen(false);
          }}
          onResume={resumeGame}
          onQuit={saveAndQuit}
        />
      )}

      <GameHeader
        level={game.level}
        currentStatus={currentStatus}
        sequenceLength={game.sequence.length}
        inputsLength={game.inputs.length}
      />

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

      <div className="flex gap-4 mt-8">
        <Button
          text="Start Game"
          onClick={game.startGame}
          disabled={game.status !== "not-started"}
          size="sm"
          fullWidth={false}
        />
        {/* Connection Toggle */}
        {!isConnected && (
          <Button
            text="Connect Arduino"
            variant="secondary"
            size="sm"
            fullWidth={false}
            onClick={connect}
          />
        )}
        <Button
          text="Reset"
          variant="danger"
          size="sm"
          fullWidth={false}
          onClick={game.reset}
        />
      </div>
    </PageWrapper>
  );
};

export default PlayPage;
