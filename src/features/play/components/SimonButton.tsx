import type { SimonButtonType } from "@/globals/types/simon";

const BUTTON_COLOR: Record<SimonButtonType, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
};

const GLOW_COLOR: Record<SimonButtonType, string> = {
  red: "shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  green: "shadow-[0_0_30px_rgba(34,197,94,0.8)]",
  blue: "shadow-[0_0_30px_rgba(59,130,246,0.8)]",
  yellow: "shadow-[0_0_30px_rgba(250,204,21,0.8)]",
};

type Props = {
  type: SimonButtonType;
  isActive: boolean;
  isDisabled: boolean;
  onClick: (type: SimonButtonType) => void;
};

const SimonButton = ({ type, isActive, isDisabled, onClick }: Props) => {
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => !isDisabled && onClick(type)}
      className={`
        ${BUTTON_COLOR[type]}
        ${
          isActive
            ? `brightness-125 scale-105 ring-4 ring-white ${GLOW_COLOR[type]}`
            : "opacity-60"
        }
        size-40
        rounded-2xl
        transition-all duration-150 ease-in-out
        
        not-disabled:active:scale-95
        disabled:cursor-not-allowed
        cursor-pointer
      `}
    />
  );
};

export default SimonButton;
