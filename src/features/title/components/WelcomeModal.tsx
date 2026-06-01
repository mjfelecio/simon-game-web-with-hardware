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
      volume: 0.1,
			loop: true
    });

    setIsOpen(false);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleStart}
    >
      <div className="space-y-12 p-2">
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

        <Button
          text="Let's Get Started"
          className="w-full font-black"
          onClick={handleStart}
        />
      </div>
    </BaseModal>
  );
}