import { useState, useCallback } from "react";
import type { SimonButtonType, GameState } from "@/globals/types/simon";

const INITIAL_BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export default function useSimonCore() {
  const [sequence, setSequence] = useState<SimonButtonType[]>([]);
  const [inputs, setInputs] = useState<SimonButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<GameState>("not-started");

  const [currentButtons, setCurrentButtons] = useState(INITIAL_BUTTONS);

  const shuffleButtons = useCallback(() => {
    setCurrentButtons([...INITIAL_BUTTONS].sort(() => Math.random() - 0.5));
  }, []);

  const generateNextSequence = useCallback((currentSeq: SimonButtonType[]) => {
    const nextColor = currentButtons[Math.floor(Math.random() * currentButtons.length)];
    return [...currentSeq, nextColor];
  }, [currentButtons]);

  const resetGame = useCallback(() => {
    setSequence([]);
    setInputs([]);
    setLevel(0);
    setStatus("not-started");
  }, []);

  return {
    currentButtons,
    sequence,
    setSequence,
    inputs,
    setInputs,
    level,
    setLevel,
    status,
    setStatus,
    generateNextSequence,
    shuffleButtons,
    resetGame,
  };
}
