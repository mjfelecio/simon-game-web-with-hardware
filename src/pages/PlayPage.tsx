import GameHeader from "@/features/play/components/GameHeader";
import PauseMenu from "@/features/play/components/PauseMenu";
import SimonButton from "@/features/play/components/SimonButton";
import { BUTTONS, STATUS_CONFIG } from "@/features/play/constants";
import useSimonGame from "@/features/play/hooks/useSimonGame";
import Button from "@/globals/components/layouts/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useState } from "react";
import { useNavigate } from "react-router";

const PlayPage = () => {
  const game = useSimonGame();
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
