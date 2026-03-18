import SimonButton, { type ButtonType } from "@/features/play/components/SimonButton";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useCallback, useState } from "react";

const BUTTONS: ButtonType[] = ["red", "green", "blue", "yellow"];

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
    await delay(500);

    for (const color of seq) {
      setActiveSequence(color);
      await delay(500);
      setActiveSequence(null);
      await delay(500);
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
    setStatus((prev) => (prev === "playing" || prev === "sequence" ? "paused" : prev));
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
              <button
                onClick={retry}
                className="w-full rounded-full border border-gray-300 bg-transparent px-8 py-4 font-header text-4xl font-bold uppercase tracking-widest text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-white hover:text-black"
              >
                Retry
              </button>
              <button
                onClick={resumeGame}
                className="w-full rounded-full border border-gray-300 bg-transparent px-8 py-4 font-header text-4xl font-bold uppercase tracking-widest text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-white hover:text-black"
              >
                Resume
              </button>
              <button
                onClick={saveAndQuit}
                className="w-full rounded-full border border-gray-300 bg-transparent px-8 py-4 font-header text-4xl font-bold uppercase tracking-widest text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-white hover:text-black"
              >
                Save & Quit
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="font-bold text-4xl capitalize text-white">Status: {status}</h1>
      <h1 className="font-bold text-4xl text-white">Level: {level}</h1>

      <div className="grid grid-cols-2 gap-4 mt-8">
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
        <button
          disabled={status !== "not-started"}
          onClick={startGame}
          className="rounded-full border border-gray-300 bg-transparent px-8 py-3 font-header text-2xl font-bold uppercase tracking-widest text-white shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-40"
        >
          Start Game
        </button>

        <button
          onClick={retry}
          className="rounded-full border border-red-400 px-8 py-3 font-header text-2xl font-bold uppercase tracking-widest text-red-400 transition-all duration-300 hover:bg-red-400 hover:text-white"
        >
          Reset
        </button>
      </div>
    </PageWrapper>
  );
};

export default PlayPage;