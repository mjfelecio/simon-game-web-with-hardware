import SimonButton, {
  type ButtonType,
} from "@/features/play/components/SimonButton";
import Button from "@/globals/components/layouts/Button";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { cn } from "@/globals/libs/styleUtils";
import { useCallback, useState } from "react";

const BUTTONS: ButtonType[] = ["red", "green", "blue", "yellow"];

const STATUS_CONFIG: Record<GameStatus, { label: string; color: string }> = {
  "not-started": { label: "Ready?", color: "text-slate-200" },
  sequence: { label: "Watch!", color: "text-yellow-400" },
  playing: { label: "Your Turn", color: "text-green-400" },
  won: { label: "Nice!", color: "text-blue-400" },
  lose: { label: "Game Over", color: "text-red-500" },
  paused: { label: "Paused", color: "text-gray-400" },
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GameStatus =
  | "not-started"
  | "sequence"
  | "playing"
  | "won"
  | "lose"
  | "paused";

const PlayPage = () => {
  const [sequence, setSequence] = useState<ButtonType[]>([]);
  const [inputs, setInputs] = useState<ButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<GameStatus>("not-started");
  const [activeSequence, setActiveSequence] = useState<ButtonType | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPlaying = status === "playing";

  const playSequence = useCallback(async (seq: ButtonType[]) => {
    setStatus("sequence");
    await delay(200);

    for (const color of seq) {
      setActiveSequence(color);
      await delay(200);
      setActiveSequence(null);
      await delay(200);
    }

    setInputs([]);
    setStatus("playing");
  }, []);

  const startGame = () => {
    const firstColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
    const newSeq = [firstColor];
    setSequence(newSeq);
    setLevel(1);
    playSequence(newSeq);
  };

  const handleInput = (newInput: ButtonType) => {
    if (!isPlaying) return;

    const nextIndex = inputs.length;
    if (newInput !== sequence[nextIndex]) {
      setStatus("lose");
      return;
    }

    const updatedInputs = [...inputs, newInput];
    setInputs(updatedInputs);

    if (updatedInputs.length === sequence.length) {
      handleWin();
    }
  };

  const handleWin = async () => {
    setStatus("won");
    await delay(800);

    const nextColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
    const newSeq = [...sequence, nextColor];

    setSequence(newSeq);
    setLevel((prev) => prev + 1);
    playSequence(newSeq);
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    setStatus((prev) =>
      prev === "playing" || prev === "sequence" ? "paused" : prev,
    );
  };

  const resumeGame = () => {
    setIsMenuOpen(false);
    setStatus((prev) => (prev === "paused" ? "playing" : prev));
  };

  const retry = () => {
    setSequence([]);
    setInputs([]);
    setLevel(0);
    setStatus("not-started");
    setIsMenuOpen(false);
  };

  const saveAndQuit = () => {
    retry();
  };

  const isButtonDisabled = status !== "playing";
  const currentStatus = STATUS_CONFIG[status];

  return (
    <PageWrapper className="relative">
      <button
        onClick={openMenu}
        className="fixed top-4 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/50 bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20"
      >
        ←
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/10 p-10 shadow-2xl backdrop-blur-xl transition-all">
            <h2 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-md">
              Paused
            </h2>
            <div className="flex flex-col gap-5">
              <Button text="Retry" onClick={retry} />
              <Button text="Resume" onClick={resumeGame} />
              <Button text="Save & Quit" onClick={saveAndQuit} />
            </div>
          </div>
        </div>
      )}

      <div className="mb-10 flex flex-col items-center gap-2">
        {/* Level Badge */}
        <div className="rounded-full bg-white/10 px-4 py-1 border border-white/20">
          <span className="text-sm font-bold tracking-widest text-white/70 uppercase">
            Level {level}
          </span>
        </div>

        <h2
          className={cn(
            "text-6xl font-black tracking-wide uppercase transition-all duration-300",
            currentStatus.color,
          )}
        >
          {currentStatus.label}
        </h2>

        {/* Progress Indicator */}
        <div className="mt-4 flex gap-1.5">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-8 rounded-full transition-all duration-500",
                i < inputs.length
                  ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  : "bg-white/10",
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {BUTTONS.map((t) => (
          <SimonButton
            key={t}
            type={t}
            isDisabled={isButtonDisabled}
            isActive={activeSequence === t}
            onClick={handleInput}
          />
        ))}
      </div>

      <div className="flex gap-4 mt-8">
        <Button
          text="Start Game"
          onClick={startGame}
          disabled={status !== "not-started"}
          size="sm"
          fullWidth={false}
        />
        <Button
          text="Reset"
          variant="danger"
          size="sm"
          fullWidth={false}
          onClick={retry}
        />
      </div>
    </PageWrapper>
  );
};

export default PlayPage;
