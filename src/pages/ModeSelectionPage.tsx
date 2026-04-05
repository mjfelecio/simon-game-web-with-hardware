import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import { ArrowRight, Lock } from "lucide-react";
import { MODES, type ModeConfig } from "@/features/mode/constants/mode-config";
import { useState } from "react";
import ModeConfigModal from "@/features/mode/components/ModeConfigModal";

const ModeSelectionPage = () => {
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<ModeConfig | null>(null);

  const handleModeClick = (mode: ModeConfig) => {
    if (mode.id === "static") {
      setSelectedMode(mode);
    } else {
      navigate(`/play?mode=${mode.id}`);
    }
  };

  const handleConfirmConfig = (settings: { targetLength?: number }) => {
    const query = new URLSearchParams({
      mode: selectedMode?.id || "classic",
      ...(settings.targetLength && { goal: settings.targetLength.toString() }),
    }).toString();

    navigate(`/play?${query}`);
    setSelectedMode(null);
  };

  return (
    <>
      <PageWrapper className="relative flex flex-col items-center justify-center py-20 px-6">
        {/* Background Tech Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-px h-full bg-linear-to-b from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-linear-to-b from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          <header className="mb-12 text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-blue-400 mb-2">
              Select Operation Mode
            </h2>
            <h1 className="text-5xl font-black italic uppercase text-white">
              Mission Profile
            </h1>
          </header>

          <div className="grid gap-4">
            {MODES.map((mode) => {
              const isAvailable = mode.available;

              return (
                <button
                  key={mode.id}
                  disabled={!isAvailable}
                  onClick={() => handleModeClick(mode)}
                  className={cn(
                    "group relative flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 w-full text-left",
                    isAvailable
                      ? "border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer"
                      : "border-white/5 bg-white/2 opacity-60 grayscale cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-xl border transition-colors",
                        isAvailable
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-emerald-950"
                          : "border-white/10 bg-white/5 text-slate-500",
                      )}
                    >
                      {mode.icon}
                    </div>

                    <div>
                      <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                        {mode.title}
                        {!isAvailable && (
                          <Lock className="w-3 h-3 text-slate-600" />
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </div>

                  {isAvailable ? (
                    <ArrowRight className="w-6 h-6 text-emerald-500 translate-x-0 group-hover:translate-x-2 transition-transform" />
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                      Locked
                    </span>
                  )}

                  {/* Decorative side accent */}
                  <div
                    className={cn(
                      "absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full transition-all",
                      isAvailable
                        ? "bg-emerald-500 opacity-0 group-hover:opacity-100"
                        : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors flex items-center gap-2 mx-auto cursor-pointer"
          >
            <span>←</span> Back to Mainframe
          </button>
        </div>
      </PageWrapper>

      <ModeConfigModal
        mode={selectedMode}
        isOpen={!!selectedMode}
        onClose={() => setSelectedMode(null)}
        onConfirm={handleConfirmConfig}
      />
    </>
  );
};

export default ModeSelectionPage;
