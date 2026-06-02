import type { GameMode } from "@/globals/types/simon";
import {
  Zap,
  Activity,
  Volume2,
  Binary,
  Cpu,
  Shuffle,
  EyeOff,
  Timer,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export type ModeConfig = {
  id: GameMode;
  title: string;
  description: string;
  icon: ReactNode;
  color: CSSProperties["color"];
  available: boolean;
};

export const MODES: ModeConfig[] = [
  {
    id: "classic",
    title: "Classic Protocol",
    description:
      // "The original memory sequence. Test your core cognitive retention.",
      "Repeat the growing sequence exactly as shown. The classic Simon experience.",
    icon: <Activity className="w-6 h-6" />,
    color: "emerald",
    available: true,
  },
  {
    id: "blitz",
    title: "Blitz Mode",
    description:
      // "High-speed sequences with shorter decay times. Requires rapid reflex.",
      "Sequences play much faster. React quickly and keep up with the pace.",
    icon: <Zap className="w-6 h-6" />,
    color: "blue",
    available: true,
  },

  {
    id: "fragment",
    title: "Fragment Protocol",
    description:
      // "Legacy data omitted. Only the newest signal fragment is transmitted. You must maintain the full stack internally.",
      "Only the newest button is shown each round. Remember the rest of the sequence yourself.",
    icon: <Cpu className="w-6 h-6" />,
    color: "rose",
    available: true,
  },
  {
    id: "echo",
    title: "Echo Protocol",
    description:
      // "Visual interfaces offline. Reconstruct the sequence using localized audio pings only.",
      "Follow the sequence using sounds only. No visual button highlights are shown.",
    icon: <Volume2 className="w-6 h-6" />,
    color: "amber",
    available: true,
  },
  {
    id: "timeattack",
    title: "Time Attack",
    description:
      // "System response test. Complete the designated transmission objective with minimum execution time.",
      "Reach the target sequence length as fast as possible.",
    icon: <Timer className="w-6 h-6" />,
    color: "violet",
    available: true,
  },
  {
    id: "burst",
    title: "Burst Transmission",
    description:
      // "A complete data packet is transmitted simultaneously. Reconstruct the entire sequence from memory in a single attempt.",
      "Watch the entire sequence once, then repeat everything in a single attempt.",
    icon: <Binary className="w-6 h-6" />,
    color: "cyan",
    available: true,
  },
  {
    id: "ghost",
    title: "Ghost Protocol",
    description:
      //  "Visual identifiers redacted. Rely on spatial memory.",
      "Button colors are hidden. Use position and memory instead.",
    icon: <EyeOff className="w-6 h-6" />,
    color: "slate",
    available: true,
  },

  {
    id: "entropy",
    title: "Entropy Protocol",
    description:
      // "Hardware address failure. The physical button configuration re-routes after every successful transmission.",
      "Button positions change after every successful round.",
    icon: <Shuffle className="w-6 h-6" />,
    color: "orange",
    available: true,
  },
];
