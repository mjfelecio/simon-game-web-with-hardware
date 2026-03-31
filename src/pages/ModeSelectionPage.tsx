import PageWrapper from "@/globals/components/layouts/PageWrapper";
import { useNavigate } from "react-router";
import { cn } from "@/globals/libs/styleUtils";
import { ArrowRight, Lock, Zap, Layers, Activity } from "lucide-react";

const MODES = [
  {
    id: "classic",
    title: "Classic Protocol",
    description:
      "The original memory sequence. Test your core cognitive retention.",
    icon: <Activity className="w-6 h-6" />,
    color: "emerald",
    available: true,
  },
  {
    id: "blitz",
    title: "Blitz Mode",
    description:
      "High-speed sequences with shorter decay times. Requires rapid reflex.",
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
    available: false,
  },
  {
    id: "zen",
    title: "Zen Focus",
    description:
      "Endless sequence without level caps. How far can your mind go?",
    icon: <Layers className="w-6 h-6" />,
    color: "purple",
    available: false,
  },
];

const ModeSelectionPage = () => {
  const navigate = useNavigate();

  return (
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
          <h1 className="text-5xl font-black italic uppercase  text-white">
            Mission Profile
          </h1>
        </header>

        <div className="grid gap-4">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              disabled={!mode.available}
              onClick={() => mode.available && navigate("/play")}
              className={cn(
                "group relative flex items-center justify-between p-6 rounded-2xl border transition-all duration-300",
                mode.available
                  ? "border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer"
                  : "border-white/5 bg-white/2 opacity-60 grayscale cursor-not-allowed",
              )}
            >
              <div className="flex items-center gap-6 text-left">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl border transition-colors",
                    mode.available
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-emerald-950"
                      : "border-white/10 bg-white/5 text-slate-500",
                  )}
                >
                  {mode.icon}
                </div>

                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest text-white flex items-center gap-2">
                    {mode.title}
                    {!mode.available && (
                      <Lock className="w-3 h-3 text-slate-600" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </div>

              {mode.available ? (
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
                  mode.available
                    ? "bg-emerald-500 opacity-0 group-hover:opacity-100"
                    : "bg-transparent",
                )}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors flex items-center gap-2 mx-auto"
        >
          <span>←</span> Back to Mainframe
        </button>
      </div>
    </PageWrapper>
  );
};

export default ModeSelectionPage;
