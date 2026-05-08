import { useCallback, useState } from "react";
import type {
  GameMode,
  GameState,
  SimonButtonType,
} from "@/globals/types/simon";
import { delay } from "@/globals/utils";
import { db } from "@/globals/libs/db";
import {
  BUTTON_FREQUENCIES,
  playLoseDissonance,
  playTone,
  playWinMelody,
} from "@/globals/utils/audio";
import { useSearchParams } from "react-router";

const BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export default function useSimonGame() {
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get("mode") ?? "classic") as GameMode;
  const goal = Number(searchParams.get("goal"));

  const [sequence, setSequence] = useState<SimonButtonType[]>([]);
  const [inputs, setInputs] = useState<SimonButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [state, setState] = useState<GameState>("not-started");
  const [activeSequence, setActiveSequence] = useState<SimonButtonType | null>(
    null,
  );

  const playSequence = useCallback(
    async (seq: SimonButtonType[]) => {
      setState("sequence");
      await delay(200);

      for (const color of seq) {
        if (mode === "echo") {
          playTone(BUTTON_FREQUENCIES[color]);
          await delay(400);
        } else {
          setActiveSequence(color);
          playTone(BUTTON_FREQUENCIES[color]);
          await delay(200);
          setActiveSequence(null);
          await delay(200);
        }
      }

      setInputs([]);
      setState("playing");
    },
    [mode],
  );

  const startGame = () => {
    const firstColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
    const newSeq = [firstColor];
    setSequence(newSeq);
    setLevel(1);
    playSequence(newSeq);
  };

  const checkVictoryCondition = useCallback(
    (currentSeq: SimonButtonType[]) => {
      switch (mode) {
        case "static":
          if (currentSeq.length === goal) return true;
          break;

        default:
          break;
      }
    },
    [mode, goal],
  );

  const handleWin = useCallback(
    async (currentSeq: SimonButtonType[]) => {
      const hasAchievedVictory = checkVictoryCondition(currentSeq);
      if (hasAchievedVictory) {
        setState("victory");
        alert("YOu actuall won wtf");
        // TODO: Victory logic when
        return;
      } else {
        setState("won");

        await delay(400);

        playWinMelody();

        await delay(1000);
      }

      // Proceed to next sequence
      const nextColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
      const newSeq = [...currentSeq, nextColor];

      setSequence(newSeq);
      setLevel((prev) => prev + 1);
      playSequence(newSeq);
    },
    [playSequence, checkVictoryCondition],
  );

  const handleLose = useCallback(async () => {
    setState("lose");
    playLoseDissonance();

    // Store score
    try {
      await db.scores.add({
        score: level, // In classic mode, level is score
        level,
        mode: "classic",
        playerName: "mjfelecio",
        achievedAt: Date.now(),
      });
    } catch (e) {
      console.error("Failed to store score: " + e);
    }
  }, [level]);

  const handleInput = useCallback(
    (newInput: SimonButtonType) => {
      if (state !== "playing") return;

      setActiveSequence(newInput);
      playTone(BUTTON_FREQUENCIES[newInput]);

      setTimeout(() => setActiveSequence(null), 200);

      const nextIndex = inputs.length;
      if (newInput !== sequence[nextIndex]) {
        handleLose();
        return;
      }

      const updatedInputs = [...inputs, newInput];
      setInputs(updatedInputs);

      if (updatedInputs.length === sequence.length) {
        handleWin(sequence);
      }
    },
    [handleLose, handleWin, inputs, sequence, state],
  );

  const reset = () => {
    setSequence([]);
    setInputs([]);
    setLevel(0);
    setState("not-started");
  };

  return {
    mode,
    sequence,
    inputs,
    level,
    status: state,
    setStatus: setState,
    activeSequence,
    startGame,
    handleInput,
    reset,
  };
}
