import type { AchievementCategory } from "../constants/achievements";
import BaseModal from "@/globals/components/layouts/BaseModal";
import AchievementItem from "./AchievementItem";
import { useAchievements } from "../hooks/useAchievements";
import type { AchievementView } from "../services/achievementServices";
import { useAuth } from "@/features/auth/components/AuthProvider";
import Button from "@/globals/components/Button";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AchievementListModal = ({ open, onClose }: Props) => {
  const { achievements } = useAchievements();
  const { isAGuest } = useAuth();

  const grouped = achievements.reduce(
    (acc, achievement) => {
      acc[achievement.category] ??= [];
      acc[achievement.category].push(achievement);
      return acc;
    },
    {
      progression: [],
      mastery: [],
      social: [],
      secret: [],
    } as Record<AchievementCategory, AchievementView[]>,
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <BaseModal isOpen={open} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="text-center">
          <h1 className="text-5xl text-center uppercase">Achievements</h1>
          {isAGuest ? (
            <p className="text-lg text-amber-500 font-black text-center">
              Login to see your achievement progress
            </p>
          ) : (
            <p className="text-lg font-black text-center uppercase">
              Progress:{" "}
              <span className="text-cyan-400">
                {unlockedCount} / {totalAchievements}
              </span>
            </p>
          )}
        </div>

        {Object.entries(grouped).map(([category, items]) => {
          const unlockedInCategory = items.filter((a) => a.unlocked).length;

          return (
            <section key={category} className="space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                <h2 className="font-black uppercase tracking-widest text-cyan-400">
                  {category}
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                  {unlockedInCategory} / {items.length}
                </span>
              </div>

              {items.map((achievement) => (
                <AchievementItem
                  key={achievement.key}
                  achievement={achievement}
                />
              ))}
            </section>
          );
        })}
      </div>

      <Button className="mt-12" text="Close" onClick={() => onClose()} />
    </BaseModal>
  );
};

export default AchievementListModal;
