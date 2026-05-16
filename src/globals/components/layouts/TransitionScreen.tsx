import { Brain, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import PageWrapper from "./PageWrapper";
import { cn } from "@/globals/libs/styleUtils";

type Props = {
  show: boolean;
  message?: string;
  duration?: number; // auto-hide delay
  onDone?: () => void;
};

const TransitionScreen = ({
  show,
  message = "Loading...",
  duration = 900,
  onDone,
}: Props) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (!show) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      return;
    }

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);

    return () => clearTimeout(t);
  }, [show, duration, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50">
      <PageWrapper className="relative overflow-hidden">
        {/* Dimmed backdrop */}
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />

        {/* Ambient glow */}
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-emerald-500/10 via-transparent to-transparent" />

        {/* Core animation */}
        <div
          className={cn(
            "relative flex flex-col items-center justify-center gap-6",
            "animate-in fade-in duration-200"
          )}
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />

            {/* Core icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/20 bg-slate-900">
              <Brain className="h-8 w-8 text-emerald-400" />
            </div>

            {/* Spinner */}
            <LoaderCircle className="absolute h-20 w-20 text-emerald-400/30 animate-spin" />
          </div>

          <p className="text-sm tracking-wide text-emerald-400/70">
            {message}
          </p>
        </div>
      </PageWrapper>
    </div>
  );
};

export default TransitionScreen;