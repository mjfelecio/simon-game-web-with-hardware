export type Score = {
  id?: number;
  playerName: string;
  score: number;
  level: number;
  mode: GameMode;
  achievedAt: number;
};

export type GameMode =
  | "classic"
  | "echo"
  | "static"
  | "blitz"
  | "fragment"
  | "entropy"
  | "ghost";

export type GameState =
  | "not-started"
  | "sequence"
  | "playing"
  | "won"
  | "lose"
  | "paused"
  | "victory";

export type SimonButtonType = "red" | "green" | "blue" | "yellow";
