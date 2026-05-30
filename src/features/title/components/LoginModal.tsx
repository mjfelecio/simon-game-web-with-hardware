import { useState } from "react";
import BaseModal from "@/globals/components/layouts/BaseModal";
import { supabase } from "@/globals/libs/db";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import type { User } from "@/globals/types/auth";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (user: User) => void;
};

const LoginModal = ({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) => {
  const { login, proceedAsGuest } = useAuth();
  const { playMusic } = useMusic();

  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = async () => {
    await playMusic(MUSIC.BG, {
      volume: 0.1,
      loop: true,
    });

    onClose();
  };

  const handleGuestContinue = async () => {
    proceedAsGuest();
    await startGame();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const { data: existingUser, error: selectError } = await supabase
        .from("users")
        .select("*")
        .eq("username", normalizedUsername)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      let user = existingUser;

      if (!user) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            username: normalizedUsername,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        user = newUser;
      }

      login(user);
      onLogin?.(user);

      setUsername("");

      await startGame();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message ?? "Something went wrong.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}}
      showCloseButton={false}
      className="max-w-md"
    >
      <div className="space-y-8">
        {/* Welcome Section */}
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

        {/* Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            maxLength={20}
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none"
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || username.trim().length < 3}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Continue & Save Progress"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="w-full text-sm text-slate-400 hover:text-white transition-colors"
        >
          Continue as Guest
        </button>
      </div>
    </BaseModal>
  );
};

export default LoginModal;