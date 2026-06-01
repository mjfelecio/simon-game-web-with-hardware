import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useEffect, useState } from "react";
import LoginModal from "@/features/title/components/LoginModal";
import { useSettings } from "@/globals/providers/SettingsProvider";
import type { SimonButtonType } from "@/globals/types/simon";
import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { SFX } from "@/features/audio/constants/sfx";
import { DEFAULT_KEY_MAP, type KeyMap } from "@/features/controllers/constants";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const BUTTONS: SimonButtonType[] = ["red", "green", "blue", "yellow"];

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const {
    musicVolume,
    sfxVolume,
    keyMap,
    setMusicVolume,
    setSfxVolume,
    setKeyMap,
  } = useSettings();

  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [listeningFor, setListeningFor] = useState<SimonButtonType | null>(
    null,
  );

  useEffect(() => {
    if (!listeningFor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      const key = e.key.toLowerCase();

      const nextMap = Object.fromEntries(
        Object.entries(keyMap).filter(
          ([button, assignedKey]) =>
            assignedKey !== key || button === listeningFor,
        ),
      );

      setKeyMap({
        ...(nextMap as KeyMap),
        [listeningFor]: key,
      });

      setListeningFor(null);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [listeningFor, keyMap, setKeyMap]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
              System
            </p>

            <h2 className="mt-2 text-4xl font-black italic uppercase text-white">
              Settings
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              {/* Audio */}
              <section className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Audio
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Music Volume</span>
                    <span className="text-sm text-slate-400">
                      {musicVolume}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">SFX Volume</span>
                    <span className="text-sm text-slate-400">{sfxVolume}%</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(Number(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              </section>

              {/* Account */}
              <section className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Account
                </p>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  {user ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Signed In As
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {user.username}
                        </p>
                      </div>

                      <Button
                        text="Logout"
                        variant="danger"
                        size="sm"
                        fullWidth
                        onClick={handleLogout}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-white font-medium">
                          Playing as Guest
                        </p>

                        <p className="text-sm text-slate-400">
                          Sign in to save scores and appear on the leaderboard.
                        </p>
                      </div>

                      <Button
                        text="Login"
                        size="sm"
                        fullWidth
                        onClick={() => setIsLoginModalOpen(true)}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-8">
              {/* Controls */}
              <section className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Controls
                </p>

                <div className="space-y-2">
                  {BUTTONS.map((button) => (
                    <div
                      key={button}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <span className="text-sm text-white capitalize">
                        {button}
                      </span>

                      <button
                        type="button"
                        onMouseEnter={() => sfxPlayer.play(SFX.BTN_HOVER)}
                        onTouchStart={() => sfxPlayer.play(SFX.BTN_HOVER)}
                        onClick={() => {
                          sfxPlayer.play(SFX.BTN_CLICK);
                          setListeningFor(button);
                        }}
                        className="cursor-pointer min-w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300"
                      >
                        {listeningFor === button
                          ? "Press key..."
                          : keyMap[button].toUpperCase()}
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  text="Reset Keybinds"
                  variant="secondary"
                  size="sm"
                  onClick={() => setKeyMap({ ...DEFAULT_KEY_MAP })}
                />
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 ">
            <Button
              text="Close"
              variant="secondary"
              fullWidth
              onClick={onClose}
            />
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={!isAuthenticated && isLoginModalOpen}
        onLogin={() => setIsLoginModalOpen(false)}
      />
    </BaseModal>
  );
};

export default SettingsModal;
