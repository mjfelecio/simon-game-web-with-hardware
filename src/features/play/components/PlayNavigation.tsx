import { cn } from "@/globals/libs/styleUtils";

type Props = {
  isConnected: boolean;
  onOpenMenu: () => void;
  onOpenHardware: () => void;
};

const PlayNavigation = ({ isConnected, onOpenMenu, onOpenHardware }: Props) => {
  return (
    <nav className="w-full z-50 flex items-center justify-between gap-4 p-6 xl:fixed top-0 left-0 right-0">
      <button
        onClick={onOpenMenu}
        className="group flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 backdrop-blur-md transition-all hover:border-white/30 hover:text-white"
      >
        <span className="text-xl transition-transform group-hover:-translate-x-0.5">
          ←
        </span>
      </button>

      <button
        onClick={onOpenHardware}
        className={cn(
          "flex items-center gap-3 rounded-xl border px-5 py-2.5 backdrop-blur-md transition-all",
          isConnected
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-white/10 bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60",
        )}
      >
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50 leading-none mb-1">
            IO Status
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
            {isConnected ? "Controller Link Active" : "No Hardware Detected"}
          </span>
        </div>
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isConnected
              ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"
              : "bg-white/20",
          )}
        />
      </button>
    </nav>
  );
};

export default PlayNavigation;