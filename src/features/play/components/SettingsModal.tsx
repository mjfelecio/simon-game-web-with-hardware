import BaseModal from "@/globals/components/layouts/BaseModal";
import Button from "@/globals/components/Button";
import { useAuth } from "@/features/auth/components/AuthProvider";
import { useState } from "react";
import LoginModal from "@/features/title/components/LoginModal";
import { useSettings } from "@/globals/providers/SettingsProvider";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SettingsModal = ({
  isOpen,
  onClose,
}: SettingsModalProps) => {
  const { musicVolume, sfxVolume, setMusicVolume, setSfxVolume } =
    useSettings();

  const { user, logout, isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="max-w-xl">
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
              <span className="text-sm text-slate-400">{musicVolume}%</span>
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
                  <p className="text-white font-medium">Playing as Guest</p>

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

      <LoginModal
        isOpen={!isAuthenticated && isLoginModalOpen}
        onLogin={() => setIsLoginModalOpen(false)}
      />
    </BaseModal>
  );
};

export default SettingsModal;
