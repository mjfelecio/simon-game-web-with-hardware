import { useState, useCallback } from "react";
import type { SimonButtonType, GameState } from "@/globals/types/simon";

const BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export default function useSimonCore() {
  const [sequence, setSequence] = useState<SimonButtonType[]>([]);
  const [inputs, setInputs] = useState<SimonButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<GameState>("not-started");

  const generateNextSequence = useCallback((currentSeq: SimonButtonType[]) => {
    const nextColor = BUTTONS[Math.floor(Math.random() * BUTTONS.length)];
    return [...currentSeq, nextColor];
  }, []);

  const resetGame = useCallback(() => {
    setSequence([]);
    setInputs([]);
    setLevel(0);
    setStatus("not-started");
  }, []);

  return {
    sequence, setSequence,
    inputs, setInputs,
    level, setLevel,
    status, setStatus,
    generateNextSequence,
    resetGame
  };
}