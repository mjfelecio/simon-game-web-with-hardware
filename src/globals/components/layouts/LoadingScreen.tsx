import { Brain, LoaderCircle } from "lucide-react";
import PageWrapper from "@/globals/components/layouts/PageWrapper";

const LoadingScreen = ({ text = "Loading..." }: { text: string }) => {
  return (
    <PageWrapper className="relative overflow-hidden">
      {/* Soft ambient glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-500/10 via-transparent to-transparent" />

      <div className="relative flex flex-col items-center justify-center gap-4 text-center">
        {/* Core loader */}
        <div className="relative flex h-24 w-24 items-center justify-center">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />

          {/* Icon base */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
            <Brain className="h-8 w-8 text-emerald-400" />
          </div>

          {/* Rotating loader */}
          <LoaderCircle className="absolute h-20 w-20 text-emerald-400/30 animate-spin" />
        </div>

        {/* Minimal status text */}
        <p className="text-md tracking-wide text-emerald-400/70">{text}</p>
      </div>
    </PageWrapper>
  );
};

export default LoadingScreen;
