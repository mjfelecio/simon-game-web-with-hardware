import PageWrapper from "@/globals/components/layouts/PageWrapper";
import Button from "@/globals/components/Button";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import StatCard from "@/globals/components/StatCard";
import { calculateAvgScore } from "@/globals/utils";
import { getScores } from "@/globals/utils/scores";
import { useEffect, useState } from "react";
import type { ScoreView } from "@/globals/types/simon";

const LeaderboardPage = () => {
  const navigate = useNavigate();
  const [topScores, setTopScores] = useState<ScoreView[]>([]);

  // Fetch top 10 scores sorted by level/score descending
  // NOTE: Currently, this fetches all scores for now
  useEffect(() => {
    async function fetchScores() {
      const scores = (await getScores()) ?? [];
      setTopScores(scores);
    }

    fetchScores();
  }, []);

  return (
    <PageWrapper className="flex flex-col items-center">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-black italic text-white uppercase drop-shadow-lg">
          Game Dashboard
        </h1>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mt-2">
          Global Statistics & Leaderboards
        </p>
      </header>

      {/* Stats Overview (Placeholder for future modes) */}
      <div className="grid w-full max-w-2xl grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Games" value={topScores?.length || 0} />
        <StatCard label="Best Level" value={topScores[0]?.score || 0} />
        <StatCard
          label="Avg. Score"
          value={calculateAvgScore(topScores || [])}
        />
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <div className="bg-white/10 px-6 py-4 border-b border-white/10">
          <h3 className="font-bold text-white uppercase tracking-wider">
            Top Performers
          </h3>
        </div>

        <div className="divide-y divide-white/5">
          {topScores?.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              No scores recorded yet. Go play!
            </div>
          ) : (
            topScores?.map((score, index) => (
              <div
                key={score.id}
                className={cn(
                  "flex items-center justify-between px-6 py-4 transition hover:bg-white/5",
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
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">
                    {score.gamemode}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-10 flex gap-4 w-[50%]">
        <Button
          size={"sm"}
          text="Back to Menu"
          onClick={() => navigate("/")}
          variant="secondary"
        />
        <Button
          size={"sm"}
          text="Play Again"
          onClick={() => navigate("/play")}
        />
      </div>
    </PageWrapper>
  );
};

export default LeaderboardPage;
