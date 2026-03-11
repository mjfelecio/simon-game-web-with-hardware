export type ButtonType = "red" | "green" | "blue" | "yellow";

type Props = {
  type: ButtonType;
  isActive: boolean;
  isDisabled: boolean;
  onClick: (type: ButtonType) => void;
};

const BUTTON_COLOR: Record<ButtonType, string> = {
  blue: "bg-blue-500",
  red: "bg-red-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
};


const SimonButton = ({ type, isActive, isDisabled, onClick }: Props) => {
  return (
    <button
      disabled={isDisabled}
      onClick={() => onClick(type)}
      type="button"
      className={`${BUTTON_COLOR[type]} ${isActive ? "opacity-100" : "opacity-40"} transition-all relative size-24 not-disabled:opacity-100 not-disabled:active:scale-105 rounded-2xl cursor-pointer`}
    >
    </button>
  );
};

export default SimonButton;
