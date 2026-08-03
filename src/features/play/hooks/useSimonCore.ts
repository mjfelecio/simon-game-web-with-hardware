import { useState, useCallback, useRef } from "react";
import type { SimonButtonType, GameState } from "@/globals/types/simon";

const INITIAL_BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

export default function useSimonCore() {
  const [sequence, setSequence] = useState<SimonButtonType[]>([]);
  const [inputs, setInputs] = useState<SimonButtonType[]>([]);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<GameState>("not-started");

  const [currentButtons, setCurrentButtons] = useState(INITIAL_BUTTONS);

  // Synchronous mirrors of derived state, safe to read inside async handlers
  // (React state closures are per-render snapshots and can go stale mid-race).
  const inputsRef = useRef<SimonButtonType[]>([]);
  const sequenceRef = useRef<SimonButtonType[]>([]);
  const levelRef = useRef(0);

  const shuffleButtons = useCallback(() => {
    setCurrentButtons([...INITIAL_BUTTONS].sort(() => Math.random() - 0.5));
  }, []);

  const generateSequence = useCallback((length: number) => {
    return Array(length)
      .fill(0)
      .map(
        () => currentButtons[Math.floor(Math.random() * currentButtons.length)],
      );
  }, [currentButtons]);

  const generateNextSequence = useCallback(
    (currentSeq: SimonButtonType[]) => {
      const nextColor =
        currentButtons[Math.floor(Math.random() * currentButtons.length)];
      return [...currentSeq, nextColor];
    },
    [currentButtons],
  );

  const resetGame = useCallback(() => {
    setSequence([]);
    inputsRef.current = [];
    setInputs([]);
    sequenceRef.current = [];
    setLevel(0);
    levelRef.current = 0;
    setStatus("not-started");
  }, []);

  return {
    currentButtons,
    sequence,
    setSequence: (next: SimonButtonType[]) => {
      sequenceRef.current = next;
      setSequence(next);
    },
    inputs,
    setInputs: (next: SimonButtonType[]) => {
      inputsRef.current = next;
      setInputs(next);
    },
    inputsRef,
    sequenceRef,
    level,
    setLevel: (next: number) => {
      levelRef.current = next;
      setLevel(next);
    },
    levelRef,
    status,
    setStatus,
    generateNextSequence,
    generateSequence,
    shuffleButtons,
    resetGame,
  };
}
