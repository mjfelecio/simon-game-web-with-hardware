import { useAuth } from "@/features/auth/components/AuthProvider";
import { useEffect, useState } from "react";
import {
  fetchAchievementsForUser,
  type AchievementView,
} from "../services/achievementServices";
import type { AchievementCategory } from "../constants/achievements";
import BaseModal from "@/globals/components/layouts/BaseModal";
import AchievementItem from "./AchievementItem";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AchievementListModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<AchievementView[]>([]);

  useEffect(() => {
    if (!open || !user) return;

    const load = async () => {
      setLoading(true);

      try {
        const data = await fetchAchievementsForUser(user.id);

        setAchievements(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, user]);

  const grouped = achievements.reduce(
    (acc, achievement) => {
      acc[achievement.category] ??= [];
      acc[achievement.category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, AchievementView[]>,
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  return (
    <BaseModal isOpen={open} onClose={onClose} className="max-w-3xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <div className="text-center">
          <h1 className="text-5xl text-center uppercase">Achievements</h1>
          <p className="text-lg font-black text-center uppercase">
            Progress: <span className="text-emerald-400">{unlockedCount}</span> /{" "}
            <span className="text-sky-400">{totalAchievements}</span>
          </p>
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-400">
            Loading achievements...
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <h2 className="font-black uppercase tracking-widest text-yellow-300">
                {category}
              </h2>

              {items.map((achievement) => (
                <AchievementItem
                  key={achievement.key}
                  achievement={achievement}
                />
              ))}
            </section>
          ))
        )}
      </div>
    </BaseModal>
  );
};

export default AchievementListModal;
