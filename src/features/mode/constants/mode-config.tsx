import type { GameMode } from "@/globals/types/simon";
import { Zap, Layers, Activity, Volume2, Binary } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type ModeConfig = {
  id: GameMode,
  title: string,
  description: string,
  icon: ReactNode,
  color: CSSProperties['color'],
  available: boolean;
}

export const MODES: ModeConfig[] = [
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
    id: "echo",
    title: "Echo Protocol",
    description:
      "Visual interfaces offline. Reconstruct the sequence using localized audio pings only.",
    icon: <Volume2 className="w-6 h-6" />,
    color: "amber",
    available: true,
  },
  {
    id: "static",
    title: "Static Transmission",
    description:
      "Select a specific data length. Complete the full string to verify system integrity.",
    icon: <Binary className="w-6 h-6" />,
    color: "cyan",
    available: true,
  },
  {
    id: "blitz",
    title: "Blitz Mode",
    description:
      "High-speed sequences with shorter decay times. Requires rapid reflex.",
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
    available: true,
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