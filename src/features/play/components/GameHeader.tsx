import { cn } from "@/globals/libs/styleUtils";
import type { GameMode, SimonButtonType } from "@/globals/types/simon";
import { BUTTON_COLOR } from "../constants";

type GameHeaderProps = {
  level: number;
  mode: GameMode;
  currentStatus: { label: string; color: string };
  sequence: SimonButtonType[];
  inputsLength: number;
};

const GameHeader = ({
  level,
  mode,
  currentStatus,
  sequence,
  inputsLength,
}: GameHeaderProps) => (
  <div className="flex flex-col min-w-80 items-center gap-2">
    <div className="flex gap-2">
      <div className="rounded-full flex justify-center items-center bg-white/10 px-4 py-1 border border-white/20">
        <span className="text-[10px] md:text-sm font-bold tracking-widest text-white/70 uppercase">
          {mode}
        </span>
      </div>
      <div className="rounded-full flex justify-center items-center bg-white/10 px-4 py-1 border border-white/20">
        <span className="text-[10px] md:text-sm font-bold tracking-widest text-white/70 uppercase">
          Level {level}
        </span>
      </div>
    </div>

    <h2
      className={cn(
        "text-5xl md:text-6xl text-center font-black tracking-wide uppercase transition-all duration-300",
        currentStatus.color,
      )}
    >
      {currentStatus.label}
    </h2>

    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
      {sequence.map((type, i) => {
        const normalButtonStyle =
          i < inputsLength && mode !== "timeattack"
            ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            : "bg-white/10";

        const timeAttackButtonStyle =
          i < inputsLength
            ? `${BUTTON_COLOR[type]} opacity-50 border-2 border-white`
            : BUTTON_COLOR[type];

        return (
          <div
            key={`${type}-${i}`}
            className={cn(
              "h-1.5 w-8 rounded-full transition-all duration-500",
              normalButtonStyle,

              mode === "timeattack"
                ? `${timeAttackButtonStyle} h-8 w-8 rounded-lg`
                : normalButtonStyle,
            )}
            style={{
              animation: "popIn 100ms ease-out",
            }}
          />
        );
      })}
    </div>
  </div>
);

export default GameHeader;
