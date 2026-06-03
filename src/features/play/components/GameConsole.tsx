import SimonButton from "@/features/play/components/SimonButton";
import type {
  GameMode,
  InputType,
  SimonButtonType,
} from "@/globals/types/simon";

type Props = {
  buttons: SimonButtonType[];
  mode: GameMode;
  activeButton: SimonButtonType | null;
  isButtonDisabled: boolean;
  showBegin: boolean;
  onInput: (type: InputType, color: SimonButtonType) => void;
};

const GameConsole = ({
  buttons,
  mode,
  activeButton,
  isButtonDisabled,
  onInput,
  showBegin,
}: Props) => {
  return (
    <div className="relative rounded-[2.5rem] w-fit bg-slate-900/40 p-6 border border-white/5 shadow-inner backdrop-blur-sm">
      {/* Decorative Corner Screws */}
      <div className="absolute top-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute bottom-4 left-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />
      <div className="absolute bottom-4 right-4 h-1.5 w-1.5 rounded-full bg-white/10 shadow-inner" />

      {showBegin && (
        <h1
          className="absolute bottom-1/2 right-1/2 translate-1/2 z-10 text-8xl text-red-500 uppercase"
          style={{ animation: "beginGame 1s forwards ease-out" }}
        >
          BEGIN!
        </h1>
      )}

      <div className="grid grid-cols-2 aspect-square place-items-center gap-4">
        {buttons.map((t) => (
          <SimonButton
            key={t}
            type={t}
            isDisabled={isButtonDisabled}
            isActive={activeButton === t}
            isGhosted={mode === "ghost"}
            onClick={onInput}
          />
        ))}
      </div>
    </div>
  );
};

export default GameConsole;
