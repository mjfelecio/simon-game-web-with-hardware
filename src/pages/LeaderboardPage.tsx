import PageWrapper from "@/globals/components/layouts/PageWrapper";
import Button from "@/globals/components/Button";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import StatCard from "@/globals/components/StatCard";
import { calculateAvgScore } from "@/globals/utils";
import { getLeaderboard } from "@/globals/utils/scores";
import { useEffect, useState } from "react";
import type { GameMode, InputType, ScoreView } from "@/globals/types/simon";
import Select from "@/globals/components/Select";

const GAMEMODES: { label: string; value: GameMode | "" }[] = [
  { label: "All Modes", value: "" },
  { label: "Classic", value: "classic" },
  { label: "Blitz", value: "blitz" },
  { label: "Entropy", value: "entropy" },
  { label: "Echo", value: "echo" },
  { label: "Fragment", value: "fragment" },
  { label: "Ghost", value: "ghost" },
  { label: "Static", value: "static" },
];

const INPUT_TYPES: { label: string; value: InputType | "" }[] = [
  { label: "All Inputs", value: "" },
  { label: "Mouse", value: "mouse" },
  { label: "Keyboard", value: "keyboard" },
  { label: "Arduino", value: "arduino" },
];

const LeaderboardPage = () => {
  const navigate = useNavigate();

  const [topScores, setTopScores] = useState<ScoreView[]>([]);
  const [gamemode, setGamemode] = useState("");
  const [inputType, setInputType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);

      try {
        const scores = await getLeaderboard({
          gamemode: gamemode || undefined,
          input_type: inputType || undefined,
          limit: 50,
        });

        setTopScores(scores);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gamemode, inputType]);

  return (
    <PageWrapper className="flex flex-col items-center">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-black italic text-white uppercase">
          Game Dashboard
        </h1>
        <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">
          Global Statistics & Leaderboards
        </p>
      </header>

      {/* Filters */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-6">
        <Select value={gamemode} onChange={setGamemode} options={GAMEMODES} />

        <Select
          value={inputType}
          onChange={setInputType}
          options={INPUT_TYPES}
        />
      </div>

      {/* Stats */}
      <div className="grid w-full max-w-2xl grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Games" value={topScores.length} />
        <StatCard label="Best Level" value={topScores[0]?.score || 0} />
        <StatCard label="Avg. Score" value={calculateAvgScore(topScores)} />
      </div>

      {/* Leaderboard */}
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="bg-white/10 px-6 py-4 border-b border-white/10">
          <h3 className="font-bold text-white uppercase tracking-wider">
            Top Performers
          </h3>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading scores...
            </div>
          ) : topScores.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No scores recorded yet. Go play!
            </div>
          ) : (
            topScores.map((score, index) => (
              <div
                key={score.id}
                className={cn(
                  "flex items-center justify-between px-6 py-4 hover:bg-white/5 transition",
                  index === 0 && "bg-yellow-500/5",
                )}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black",
                      index === 0
                        ? "bg-yellow-400 text-black"
                        : "bg-white/10 text-white",
                    )}
                  >
                    {index + 1}
                  </span>

                  <div>
                    <p className="font-bold text-white">{score.username}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(score.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-white italic">
                    LVL {score.score}
                  </p>
                  <p className="text-[10px] uppercase text-slate-400">
                    {score.gamemode}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 flex gap-4 w-[50%]">
        <Button
          size="sm"
          text="Back to Menu"
          onClick={() => navigate("/")}
          variant="secondary"
        />
        <Button size="sm" text="Play Again" onClick={() => navigate("/play")} />
      </div>
    </PageWrapper>
  );
};

export default LeaderboardPage;
