import { useState } from "react";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true);

  const { playMusic } = useMusic();

  const handleStart = async () => {
    await playMusic(MUSIC.BG, {
      volume: 0.4,
			loop: true
    });

    setIsOpen(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}}
    >
      <div className="space-y-8 p-2">
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
            Welcome Player
          </p>

          <h1 className="text-4xl font-black italic uppercase text-white">
            Simon Game
          </h1>

          <p className="text-sm leading-relaxed text-slate-400">
            A modern arcade reinterpretation of the classic Simon memory game.
            Built as a school project using React, Vite, Supabase, and Arduino
            hardware integration.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Features
          </p>

          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Dynamic gameplay modifiers</li>
            <li>• Competitive leaderboard system</li>
            <li>• Hardware controller support</li>
            <li>• Arcade-inspired audiovisual feedback</li>
          </ul>
        </div>

        <Button
          text="Let's Get Started"
          className="w-full h-14 text-lg font-black uppercase tracking-widest"
          onClick={handleStart}
        />
      </div>
    </BaseModal>
  );
}