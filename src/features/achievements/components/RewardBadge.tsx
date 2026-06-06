import type { ReactElement } from "react";
import type { AchievementReward } from "../constants/rewards";

import { UnlockIcon, PaletteIcon, TagIcon } from "lucide-react";

function getRewardValue(reward: AchievementReward): string {
  switch (reward.type) {
    case "unlock_mode":
      return reward.mode;
    case "title":
      return reward.title;
    case "theme":
      return reward.theme;
  }
}

const REWARD_BADGE_CONFIG: Record<
  AchievementReward["type"],
  { title: string; Icon: ReactElement }
> = {
  unlock_mode: {
    title: "Unlock a new gamemode",
    Icon: <UnlockIcon size={14} />,
  },
  theme: {
    title: "Use a custom simon button theme",
    Icon: <PaletteIcon size={14} />,
  },
  title: {
    title: "Receive an in-game title",
    Icon: <TagIcon size={14} />,
  },
};

const RewardBadge = ({ reward }: { reward: AchievementReward }) => {
  const config = REWARD_BADGE_CONFIG[reward.type];

  return (
    <span
      title={config.title}
      className="cursor-pointer flex gap-1 items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-200"
    >
      {config.Icon} {getRewardValue(reward)}
    </span>
  );
};

export default RewardBadge;
