import { useNavigate } from "react-router";
import Button from "@/globals/components/Button";
import StatCard from "@/globals/components/StatCard";
import { formatDuration } from "@/globals/utils/formatter";
import type { GameMode } from "@/globals/types/simon";
import { useMemo } from "react";

type Props = {
  variant: "victory" | "lose";
  mode: GameMode;

  level: number;
  goal?: number;

  timeTaken?: number;
  avgReactionTime: number | null;

  isEndless: boolean;

  onRetry: () => void;
};

const VICTORY_TITLES: Record<GameMode, string> = {
  classic: "Sequence Mastered",
  blitz: "Blitz Completed",
  entropy: "Chaos Stabilized",
  echo: "Echo Captured",
  fragment: "Fragment Recovered",
  ghost: "Ghost Tracked",
  burst: "Burst Achieved",
  timeattack: "Benchmark Complete",
};

const DEFEAT_TITLES: Record<GameMode, string> = {
  classic: "Pattern Lost",
  blitz: "Response Timeout",
  entropy: "System Destabilized",
  echo: "Signal Lost",
  fragment: "Reconstruction Failed",
  ghost: "Target Escaped",
  burst: "Chain Broken",
  timeattack: "Benchmark Failed",
};

const GameResultOverlay = ({
  variant,
  mode,
  level,
  goal,
  timeTaken,
  isEndless,
  avgReactionTime,
  onRetry,
}: Props) => {
  const navigate = useNavigate();

  const isVictory = variant === "victory";

  const primaryStat = useMemo(() => {
    if (!isEndless) {
      return {
        label: isVictory ? "Goal" : "Progress",
        value: isVictory ? (goal ?? "--") : `${level} / ${goal}`,
      };
    }

    return {
      label: "Level Reached",
      value: level,
    };
  }, [isEndless, isVictory, level, goal]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div
        className={`w-full max-w-xl rounded-3xl border-4 p-8 text-center shadow-2xl ${
          isVictory
            ? "border-emerald-500/30 bg-slate-950/95"
            : "border-red-500/30 bg-slate-950/95"
        }`}
      >
        <p
          className={`text-xs font-black uppercase tracking-[0.4em] ${
            isVictory ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isVictory ? "Mission Complete" : "Mission Failed"}
        </p>

        <h1 className="mt-3 text-4xl md:text-5xl font-black italic uppercase text-white">
          {isVictory ? VICTORY_TITLES[mode] : DEFEAT_TITLES[mode]}
        </h1>

        <p className="mt-4 text-slate-400">
          {isVictory
            ? "Sequence successfully executed without critical errors."
            : "Sequence validation failed. Recalibration required."}
        </p>

        <div className="my-8 h-px bg-white/10" />

        <div className="grid grid-cols-2 gap-3">
          <StatCard label={primaryStat.label} value={primaryStat.value} />
          <StatCard
            label={"Avg Reaction Time"}
            value={avgReactionTime ? `${avgReactionTime} ms` : "--"}
          />

          <StatCard
            spanTwoCol
            label={"Time"}
            value={timeTaken ? formatDuration(timeTaken) : "--"}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            text="Leaderboard"
            variant="secondary"
            onClick={() => navigate("/leaderboard")}
          />

          <Button
            text={isVictory ? "Play Again" : "Retry Again"}
            variant={isVictory ? "primary" : "danger"}
            onClick={onRetry}
          />
        </div>
      </div>
    </div>
  );
};

export default GameResultOverlay;
