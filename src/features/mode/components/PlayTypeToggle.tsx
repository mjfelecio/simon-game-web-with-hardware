import { SFX } from "@/features/audio/constants/sfx";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { cn } from "@/globals/libs/styleUtils";
import { Zap, Trophy } from "lucide-react";

type PlayType = "campaign" | "quickplay";

type Props = {
  selected: PlayType;
  onPlayTypeChange: (type: PlayType) => void;
};

const PLAY_TYPE_CONFIG: Record<
  PlayType,
  { label: string; icon: typeof Zap; description: string }
> = {
  campaign: {
    label: "Campaign",
    icon: Trophy,
    description: "Track progress, unlock achievements",
  },
  quickplay: {
    label: "Quick Play",
    icon: Zap,
    description: "Jump in, no strings attached",
  },
};

const PlayTypeToggle = ({ selected, onPlayTypeChange }: Props) => {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1",
        "rounded-2xl border border-white/10",
        "bg-white/5 p-1.5",
        "backdrop-blur-sm",
      )}
    >
      {(["campaign", "quickplay"] as PlayType[]).map((type) => {
        const { label, icon: Icon, description } = PLAY_TYPE_CONFIG[type];
        const isActive = selected === type;

        return (
          <button
            key={type}
            type="button"
            onMouseEnter={() => sfxPlayer.play(SFX.BTN_HOVER)}
            onTouchStart={() => sfxPlayer.play(SFX.BTN_HOVER)}
            onClick={() => {
              sfxPlayer.play(SFX.BTN_CLICK);
              onPlayTypeChange(type);
            }}
            title={description}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-5 py-2.5",
              "text-sm font-bold tracking-wider uppercase",
              "transition-all duration-300 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
              isActive
                ? cn(
                    " bg-emerald-500/20 ",
                    "text-emerald-300",
                    "shadow-lg shadow-emerald-500/10",
                    "border border-emerald-400/20",
                  )
                : cn(
                    "text-white/40 hover:text-white/70",
                    "hover:bg-white/5",
                    "border border-transparent",
                  ),
            )}
          >
            {/* Glow pill behind active icon */}
            {isActive && (
              <span className="absolute inset-0 rounded-xl bg-emerald-400/5 blur-md" />
            )}

            <Icon
              size={16}
              className={cn(
                "transition-transform duration-300",
                isActive && "scale-110",
              )}
            />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PlayTypeToggle;
