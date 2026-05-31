export type LeaderboardType = "level" | "speed";

export const LEADERBOARD_CONFIG = {
  classic: {
    type: "level",
  },
  blitz: {
    type: "level",
  },
  echo: {
    type: "level",
  },
  ghost: {
    type: "level",
  },
  fragment: {
    type: "level",
  },
  entropy: {
    type: "level",
  },
  burst: {
    type: "level",
  },
  timeattack: {
    type: "speed",
  },
} as const;

export const getLeaderboardType = (mode?: string): LeaderboardType => {
  if (!mode) {
    return "level";
  }

  return (
    LEADERBOARD_CONFIG[mode as keyof typeof LEADERBOARD_CONFIG]?.type ?? "level"
  );
};
