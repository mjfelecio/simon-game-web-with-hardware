import GameHeader from "@/features/play/components/GameHeader";
import PauseMenu from "@/features/play/components/PauseMenu";
import SimonButton from "@/features/play/components/SimonButton";
import { BUTTONS, STATUS_CONFIG } from "@/features/play/constants";
import useArduinoInput from "@/features/play/hooks/useArduinoInput";
import useSimonGame from "@/features/play/hooks/useSimonGame";
import Button from "@/globals/components/Button";
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
    <PageWrapper className="relative flex flex-col items-center justify-center pb-20">
      {/* Top Navigation Bar */}
      <nav className="w-full z-50 flex items-center justify-between gap-4 p-6 xl:fixed top-0 left-0 right-0">
        <button
          onClick={openMenu}
          className="group flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
        >
          <span className="text-xl transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
        </button>

        <button
          onClick={() => setIsHardwareModalOpen(true)}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-5 py-2.5 backdrop-blur-md transition-all",
            isConnected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-white/10 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60",
          )}
        >
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50 leading-none mb-1">
              IO Status
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              {isConnected ? "Controller Link Active" : "No Hardware Detected"}
            </span>
          </div>
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isConnected
                ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"
                : "bg-white/20",
            )}
          />
        </button>
      </nav>

      {/* Game Console Frame */}
      <div className="relative w-full max-w-md mt-12 flex flex-col items-center gap-10">
        {/* Header Area */}
        <div className="px-2">
          <GameHeader
            level={game.level}
            currentStatus={currentStatus}
            sequenceLength={game.sequence.length}
            inputsLength={game.inputs.length}
          />
        </div>

        <div className="relative rounded-[2.5rem] w-fit bg-slate-900/40 p-6 border border-white/5 shadow-inner backdrop-blur-sm">
          {/* Decorative Corner Screws */}
          <div className="absolute top-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
          <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
          <div className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
          <div className="absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />

          <div className="grid grid-cols-2 aspect-square place-items-center gap-4">
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
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-center gap-4">
          {game.status === "not-started" ? (
            <Button
              text="Start Sequence"
              onClick={game.startGame}
              size={"sm"}
            />
          ) : (
            <Button
              text="Reset System"
              size={"sm"}
              variant="danger"
              onClick={game.reset}
            />
          )}
        </div>
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
