import { cn } from "@/globals/libs/styleUtils";
import RewardBadge from "./RewardBadge";
import type { AchievementView } from "../services/achievementServices";
import { LockKeyholeIcon, TrophyIcon } from "lucide-react";

type AchievementItemProps = {
  achievement: AchievementView;
};

const AchievementItem = ({ achievement }: AchievementItemProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition",
        achievement.unlocked
          ? "border-yellow-400/20 bg-yellow-500/5"
          : "border-white/5 bg-white/5 opacity-70",
      )}
    >
      <div className="flex gap-4">
        <div className="text-4xl">
          {achievement.unlocked ? (
            <TrophyIcon className="h-7 w-7 text-yellow-300" />
          ) : (
            <LockKeyholeIcon size={36} color="#62748e" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white tracking-wider">
              {achievement.name}
            </h3>

            {achievement.unlocked && (
              <span className="text-xs uppercase font-bold text-yellow-300">
                Unlocked
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-400">
            {achievement.description}
          </p>

          {achievement.rewards.length > 0 && (
            <div className="mt-3 flex items-center flex-wrap gap-2">
              <p className="mt-1 text-sm text-slate-400">Rewards: </p>
              {achievement.rewards.map((reward, index) => (
                <RewardBadge key={index} reward={reward} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementItem;
