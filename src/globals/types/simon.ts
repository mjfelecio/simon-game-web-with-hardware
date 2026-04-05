export type Score = {
  id?: number;
  playerName: string;
  score: number;
  level: number;
  mode: GameMode;
  achievedAt: number;
};

export type GameMode = "classic" | "echo" | "blitz" | "zen";

export type GameState =
  | "not-started"
  | "sequence"
  | "playing"
  | "won"
  | "lose"
  | "paused";

export type SimonButtonType = "red" | "green" | "blue" | "yellow";
