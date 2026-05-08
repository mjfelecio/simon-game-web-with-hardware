import { useState } from "react";
import { cn } from "@/globals/libs/styleUtils";
import { Play, Target } from "lucide-react";
import BaseModal from "@/globals/components/layouts/BaseModal";
import type { ModeConfig } from "@/features/mode/constants/mode-config";

type Props = {
  mode: ModeConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (settings: { goal?: number }) => void;
};

const ModeConfigModal = ({ mode, isOpen, onClose, onConfirm }: Props) => {
  const [goal, setGoal] = useState(10);

  if (!mode) return null;

  const handleStart = () => {
    onConfirm({
      goal: mode.id === "static" ? goal : undefined,
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-white">
            Mission Details
          </h2>
        </div>
      </div>
      <div className="space-y-6 py-4">
        {/* Mode Identification */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-emerald-400">{mode.icon}</div>
          <div>
            <h4 className="font-black uppercase tracking-widest text-white">
              {mode.title}
            </h4>
            <p className="text-xs text-slate-400">{mode.description}</p>
          </div>
        </div>

        {/* Conditional Input: Static Transmission Specific */}
        {mode.id === "static" && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Target className="w-3 h-3" /> Target Sequence Length
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((val) => (
                <button
                  key={val}
                  onClick={() => setGoal(val)}
                  className={cn(
                    "py-3 rounded-lg border font-bold transition-all",
                    goal === val
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20",
                  )}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          Initialize Mission{" "}
          <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </BaseModal>
  );
};

export default ModeConfigModal;
