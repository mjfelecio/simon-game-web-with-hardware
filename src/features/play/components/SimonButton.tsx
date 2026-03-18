import { useState } from "react";

export type ButtonType = "red" | "green" | "blue" | "yellow";

type Props = {
  type: ButtonType;
  isActive: boolean;
  isDisabled: boolean;
  onClick: (type: ButtonType) => void;
};

const BUTTON_COLOR: Record<ButtonType, string> = {
  red: "bg-red-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
};

const GLOW_COLOR: Record<ButtonType, string> = {
  red: "shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  green: "shadow-[0_0_30px_rgba(34,197,94,0.8)]",
  blue: "shadow-[0_0_30px_rgba(59,130,246,0.8)]",
  yellow: "shadow-[0_0_30px_rgba(250,204,21,0.8)]",
};

const SimonButton = ({ type, isActive, isDisabled, onClick }: Props) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (isDisabled) return;

    setIsPressed(true);
    onClick(type);

    setTimeout(() => setIsPressed(false), 200);
  };

  const active = isActive || isPressed;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      className={`
        ${BUTTON_COLOR[type]}

        ${active 
          ? `brightness-125 scale-105 ring-4 ring-white ${GLOW_COLOR[type]}`
          : "opacity-60"}

        size-40
        rounded-2xl

        transition-all duration-150 ease-in-out

        active:scale-95
        active:brightness-110

        disabled:cursor-not-allowed
        cursor-pointer
      `}
    />
  );
};

export default SimonButton;