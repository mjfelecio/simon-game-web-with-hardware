import SimonButton, {
  type ButtonType,
} from "@/features/play/components/SimonButton";
import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useCallback, useState } from "react";

const BUTTONS: ButtonType[] = ["red", "green", "blue", "yellow"];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GameStatus =
  | "not-started"
  | "showing-sequence"
  | "playing"
  | "check-input"
  | "won"
  | "lose";

const PlayPage = () => {
  const [sequence, setSequence] = useState<ButtonType[]>([]);
  const [inputs, setInputs] = useState<ButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<GameStatus>("not-started");
  const [activeSequence, setActiveSequence] = useState<ButtonType | null>(null);

  const isPlaying = status === "playing";

  const playSequence = useCallback(async (seq: ButtonType[]) => {
    setStatus("showing-sequence");
    await delay(500);
    for (let i = 0; i < seq.length; i++) {
      setActiveSequence(seq[i]);
      await delay(500);
      setActiveSequence(null);
      await delay(500);
    }
    setInputs([]);
    setStatus("playing");
  }, []);

  function startGame() {
    const firstColor = BUTTONS[Math.floor(Math.random() * 4)];
    const newSeq = [firstColor];
    setSequence(newSeq);
    setLevel(1);
    playSequence(newSeq);
  }

  function handleInput(newInput: ButtonType) {
    if (status !== "playing") return;

    const nextInputIndex = inputs.length;

    if (newInput !== sequence[nextInputIndex]) {
      setStatus("lose");
      return;
    }

    const updatedInputs = [...inputs, newInput];
    setInputs(updatedInputs);

    if (updatedInputs.length === sequence.length) {
      handleWin();
    }
  }
  async function handleWin() {
    setStatus("won");
    await delay(800);
    const nextColor = BUTTONS[Math.floor(Math.random() * 4)];
    const newSeq = [...sequence, nextColor];

    setSequence(newSeq);
    setLevel((prev) => prev + 1);
    playSequence(newSeq);
  }

  function retry() {
    setSequence([]);
    setInputs([]);
    setLevel(0);
    setStatus("not-started");
  }

  return (
    <PageWrapper>
    <div className="gap-8">
      <h1 className="font-bold text-5xl capitalize">Status: {status}</h1>
      <h1 className="font-bold text-5xl">Level: {level}</h1>

      <div className="flex flex-row gap-4">
        {BUTTONS.map((t) => (
          <SimonButton
            key={t}
            type={t}
            isDisabled={!isPlaying}
            isActive={activeSequence === t}
            onClick={handleInput}
          />
        ))}
      </div>

      <div className="flex flex-row gap-4">
        <button
          disabled={status !== "not-started"}
          onClick={startGame}
          className="bg-blue-400 py-2 px-4 font-bold border-blue-500 border-2 rounded-xl disabled:opacity-50"
        >
          Start Game
        </button>

        <button
          onClick={retry}
          className="bg-red-400 py-2 px-4 font-bold border-red-500 border-2 rounded-xl"
        >
          Reset
        </button>
      </div>
    </div>
    </PageWrapper>
  );
};

export default PlayPage;
