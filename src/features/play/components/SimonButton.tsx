import type { SimonButtonType } from "@/globals/types/simon";
import { cn } from "@/globals/libs/styleUtils";

const BUTTON_COLOR: Record<SimonButtonType, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
};

const GLOW_COLOR: Record<SimonButtonType, string> = {
  red: "shadow-[0_0_40px_rgba(239,68,68,0.6)]",
  green: "shadow-[0_0_40px_rgba(34,197,94,0.6)]",
  blue: "shadow-[0_0_40px_rgba(59,130,246,0.6)]",
  yellow: "shadow-[0_0_40px_rgba(250,204,21,0.6)]",
};

type Props = {
  type: SimonButtonType;
  isActive: boolean;
  isDisabled: boolean;
  isGhosted: boolean;
  onClick: (type: SimonButtonType) => void;
};

const SimonButton = ({
  type,
  isActive,
  isDisabled,
  isGhosted,
  onClick,
}: Props) => {
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick(type)}
      style={{
        width: "clamp(120px, 25vw, 180px)",
      }}
      className={cn(
        "relative aspect-square rounded-4xl transition-all duration-150 ease-in-out cursor-pointer",
        "border-b-8 border-black/20 shadow-xl ",

        // Base Color: If ghosted and not currently playing back, hide the color
        isGhosted && !isActive ? "bg-slate-600" : BUTTON_COLOR[type],

        isActive
          ? `brightness-125 scale-105 ring-4 ring-white z-10 ${GLOW_COLOR[type]}`
          : cn("opacity-40"),

        // If ghosted, we go full grayscale to hide the identity
        isGhosted ? "grayscale-100 brightness-50" : "grayscale-[0.2]",

        "disabled:cursor-not-allowed",
        "not-disabled:active:scale-95 not-disabled:active:border-b-0 not-disabled:active:translate-y-1",
      )}
    >
      {/* Subtle Inner Highlight for glass/plastic effect */}
      <div className="absolute inset-0 rounded-[1.8rem] bg-linear-to-tr from-transparent via-white/10 to-white/20 pointer-events-none" />
    </button>
  );
};

export default SimonButton;
