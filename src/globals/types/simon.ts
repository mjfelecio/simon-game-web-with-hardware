export type Scores = {
	id?: number;
	playerName: string;
	score: number;
	level: number;
	mode: GameMode;
	achievedAt: number;
}

export type GameMode = 'classic';
