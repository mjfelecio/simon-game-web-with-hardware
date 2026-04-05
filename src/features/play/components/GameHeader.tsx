import { cn } from "@/globals/libs/styleUtils";

type GameHeaderProps = {
  level: number;
  currentStatus: { label: string; color: string };
  sequenceLength: number;
  inputsLength: number;
};

const GameHeader = ({ level, currentStatus, sequenceLength, inputsLength }: GameHeaderProps) => (
  <div className="flex flex-col items-center gap-2">
    <div className="rounded-full bg-white/10 px-4 py-1 border border-white/20">
      <span className="text-sm font-bold tracking-widest text-white/70 uppercase">
        Level {level}
      </span>
    </div>

    <h2 className={cn("text-5xl md:text-6xl text-center font-black tracking-wide uppercase transition-all duration-300", currentStatus.color)}>
      {currentStatus.label}
    </h2>

    <div className="mt-4 flex gap-1.5">
      {Array.from({ length: sequenceLength }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-8 rounded-full transition-all duration-500",
            i < inputsLength
              ? "bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              : "bg-white/10",
          )}
        />
      ))}
    </div>
  </div>
);

export default GameHeader;