import { useState } from "react";
import BaseModal from "@/globals/components/layouts/BaseModal";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";
import { emailFromUsername } from "@/features/auth/constants/auth";
import { InfoIcon } from "lucide-react";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";

type LoginModalProps = {
  isOpen: boolean;
  onLogin?: () => void;
};

const LoginModal = ({ isOpen, onLogin }: LoginModalProps) => {
  const { login, register, proceedAsGuest } = useAuth();
  const { playMusic } = useMusic();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = async () => {
    await playMusic(MUSIC.BG);

    setUsername("");
    setPassword("");
    setError("");
    onLogin?.();
  };

  const handleGuestContinue = async () => {
    proceedAsGuest();

    sfxPlayer.play(SFX.BTN_CLICK);
    await startGame();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (isRegistering && username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const email = emailFromUsername(username);

    try {
      setIsSubmitting(true);

      if (isRegistering) {
        await register(
          email.trim().toLowerCase(),
          password,
          username.trim().toLowerCase(),
        );
      } else {
        await login(username.trim().toLowerCase(), password);
      }

      await startGame();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
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
        <h1 className="text-4xl text-center font-black tracking-wide uppercase text-white">
          {isRegistering ? "Sign up" : "Login"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80"
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              maxLength={20}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/80"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1">
              <InfoIcon color="red" size={16} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistering
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            sfxPlayer.play(SFX.BTN_CLICK);
            setIsRegistering((v) => !v);
          }}
          className="w-full text-sm text-slate-400 hover:text-white"
        >
          {isRegistering
            ? "Already have an account? Sign In"
            : "Need an account? Register"}
        </button>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="w-full text-sm text-slate-400 hover:text-white"
        >
          Continue as Guest
        </button>
      </div>
    </BaseModal>
  );
};

export default LoginModal;
