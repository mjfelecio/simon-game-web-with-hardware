import type { Score } from "@/globals/types/simon";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const calculateAvgScore = (scores: Score[]) => {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, curr) => acc + curr.score, 0);
  return Math.round(sum / scores.length);
};