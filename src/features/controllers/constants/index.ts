import type { SimonButtonType } from "@/globals/types/simon";

export type KeyMap = Record<SimonButtonType, string>;

export const DEFAULT_KEY_MAP: KeyMap = {
  red: "d",
  green: "f",
  blue: "j",
  yellow: "k",
};
