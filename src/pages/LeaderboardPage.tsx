import PageWrapper from "@/globals/components/layouts/PageWrapper";
import Button from "@/globals/components/Button";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import StatCard from "@/globals/components/StatCard";
import { calculateAvgScore, formatInputTypes } from "@/globals/utils";
import { getLeaderboard } from "@/globals/utils/scores";
import { useEffect, useState } from "react";
import type { GameMode, InputType, ScoreView } from "@/globals/types/simon";
import Select from "@/globals/components/Select";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { formatDuration } from "@/globals/utils/formatter";
import PaginationButton from "@/features/leaderboard/components/PaginationButton";

const GAMEMODES: { label: string; value: GameMode }[] = [
  { label: "Classic", value: "classic" },
  { label: "Blitz", value: "blitz" },
  { label: "Entropy", value: "entropy" },
  { label: "Echo", value: "echo" },
  { label: "Fragment", value: "fragment" },
  { label: "Ghost", value: "ghost" },
  { label: "Burst", value: "burst" },
  { label: "Time Attack", value: "timeattack" },
];

const INPUT_TYPES: { label: string; value: InputType | "" }[] = [
  { label: "All Inputs", value: "" },
  { label: "Touch", value: "touch" },
  { label: "Mouse", value: "mouse" },
  { label: "Keyboard", value: "keyboard" },
  { label: "Arduino", value: "arduino" },
];

const LIMIT = 10;

const LeaderboardPage = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  // Top 100
  const [topScores, setTopScores] = useState<ScoreView[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);

  const [gamemode, setGamemode] = useState("classic");
  const [inputType, setInputType] = useState("");
  const [loading, setLoading] = useState(false);

  const isTimeAttack = gamemode === "timeattack";
  const isBurst = gamemode === "burst";

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);

      try {
        const { data: scores, count } = await getLeaderboard({
          gamemode: gamemode || undefined,
          input_type: inputType || undefined,
          page,
          limit: LIMIT,
        });

        setTotalEntries(count ?? 0);
        setTopScores(scores);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [gamemode, page, inputType]);

  // Reset page when changing filters
  useEffect(() => {
    setPage(0);
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
      <section className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-6">
        <Select value={gamemode} onChange={setGamemode} options={GAMEMODES} />

        <Select
          value={inputType}
          onChange={setInputType}
          options={INPUT_TYPES}
        />
      </section>

      {/* Stats */}
      <section className="grid w-full max-w-2xl grid-cols-3 gap-4 mb-8">
        <StatCard label="Entries" value={totalEntries} />

        {isTimeAttack ? (
          <>
            <StatCard
              label="Best Time"
              value={
                topScores[0]?.time_taken
                  ? formatDuration(topScores[0].time_taken)
                  : "--"
              }
            />

            <StatCard
              label="Runs"
              value={topScores.filter((s) => s.time_taken != null).length}
            />
          </>
        ) : (
          <>
            <StatCard
              label={isBurst ? "Largest Burst" : "Top Score"}
              value={
                isBurst ? (topScores[0]?.goal ?? 0) : (topScores[0]?.level ?? 0)
              }
            />

            <StatCard
              label={isBurst ? "Avg Burst" : "Avg Level"}
              value={calculateAvgScore(topScores)}
            />
          </>
        )}
      </section>

      {/* Leaderboard */}
      <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h3 className="px-6 py-4 font-bold text-white uppercase tracking-wider border-b border-white/10">
          {isTimeAttack
            ? "Fastest Runs"
            : isBurst
              ? "Largest Bursts"
              : "Top Performers"}
        </h3>

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
            topScores.map((score, index) => {
              const rank = page * LIMIT + index + 1;

              return (
                <div
                  key={score.id}
                  className={cn(
                    "flex items-center justify-between px-6 py-4 hover:bg-white/5 transition",
                    rank === 0 && "bg-yellow-500/5",
                  )}
                  onMouseEnter={() => sfxPlayer.play(SFX.LB_HOVER)}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black",
                        rank === 1
                          ? "bg-yellow-400 text-black"
                          : rank === 2
                            ? "bg-slate-300 text-black"
                            : rank === 3
                              ? "bg-orange-400 text-black"
                              : "bg-white/10 text-white",
                      )}
                    >
                      {rank}
                    </span>

                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-bold text-white">{score.username}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(score.created_at).toLocaleDateString()}
                          {" | "}
                          {formatInputTypes(score.input_type)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-right">
                      {isTimeAttack ? (
                        <>
                          <p className="text-xl font-black text-violet-300 italic">
                            {formatDuration(score.time_taken ?? 0)}
                          </p>

                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Goal {score.goal}
                          </p>
                        </>
                      ) : isBurst ? (
                        <>
                          <p className="text-xl font-black text-cyan-300 italic">
                            {score.goal}
                          </p>

                          {score.time_taken && (
                            <p className="text-[10px] uppercase text-slate-400">
                              {formatDuration(score.time_taken)}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xl font-black text-white italic">
                          LVL {score.level}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <PaginationButton
        page={page}
        onPageChange={setPage}
        prevDisabled={page === 0}
        nextDisabled={(page + 1) * LIMIT >= totalEntries}
      />

      {/* Actions */}
      <div className="mt-24 flex flex-col md:flex-row w-full max-w-2xl gap-4">
        <Button
          size="sm"
          text="Back to Menu"
          onClick={() => navigate("/")}
          className="h-12"
          variant="secondary"
        />
        <Button
          className="h-12"
          size="sm"
          text="Play Again"
          onClick={() => navigate("/mode")}
        />
      </div>
    </PageWrapper>
  );
};

export default LeaderboardPage;
