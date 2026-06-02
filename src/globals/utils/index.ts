import type { Score } from "@/globals/types/simon";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const calculateAvgScore = (scores: Score[]) => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr.level, 0);
  return Math.round(sum / scores.length);
};

export function formatInputTypes(inputTypesStr: string) {
  const inputTypes = inputTypesStr.split(",");

  if (inputTypes.length > 1) return "Mixed";

  if (inputTypes[0] === "touch") return "Touch"
  if (inputTypes[0] === "mouse") return "Mouse"
  if (inputTypes[0] === "keyboard") return "Keyboard"
  if (inputTypes[0] === "arduino") return "Arduino"
}