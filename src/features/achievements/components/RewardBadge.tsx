import type { AchievementReward } from "../constants/rewards";

import { UnlockIcon, PaletteIcon, TagIcon } from "lucide-react";

const RewardBadge = ({ reward }: { reward: AchievementReward }) => {
  switch (reward.type) {
    case "unlock_mode":
      return (
        <span
          title="Unlock a new gamemode"
          className="cursor-pointer flex gap-1 items-center rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300"
        >
          <UnlockIcon size={14} /> {reward.mode}
        </span>
      );

    case "theme":
      return (
        <span
          title="Use a custom simon button theme"
          className="cursor-pointer flex gap-1 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-300"
        >
          <PaletteIcon size={14} /> {reward.theme}
        </span>
      );

    case "title":
      return (
        <span
          title="Receive a title"
          className="cursor-pointer flex gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300"
        >
          <TagIcon size={14} /> {reward.title}
        </span>
      );
  }
};

export default RewardBadge;
