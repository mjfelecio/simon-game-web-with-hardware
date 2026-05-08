import SimonButton from "@/features/play/components/SimonButton";
import type { SimonButtonType } from "@/globals/types/simon";

type Props = {
  buttons: SimonButtonType[];
  activeButton: SimonButtonType | null;
  isButtonDisabled: boolean;
  onInput: (color: SimonButtonType) => void;
};

const GameConsole = ({ buttons, activeButton, isButtonDisabled, onInput }: Props) => {
  return (
    <div className="relative rounded-[2.5rem] w-fit bg-slate-900/40 p-6 border border-white/5 shadow-inner backdrop-blur-sm">
      {/* Decorative Corner Screws */}
      <div className="absolute top-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />

      <div className="grid grid-cols-2 aspect-square place-items-center gap-4">
        {buttons.map((t) => (
          <SimonButton
            key={t}
            type={t}
            isDisabled={isButtonDisabled}
            isActive={activeButton === t}
            onClick={onInput}
          />
        ))}
      </div>
    </div>
  );
};

export default GameConsole;