import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SettingsContextValue = {
  musicVolume: number;
  sfxVolume: number;

  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
};

const STORAGE_KEYS = {
  MUSIC_VOLUME: "simon-settings-music-volume",
  SFX_VOLUME: "simon-settings-sfx-volume",
};

const DEFAULT_MUSIC_VOLUME = 20;
const DEFAULT_SFX_VOLUME = 100;

const SettingsContext = createContext<SettingsContextValue | null>(null);

type SettingsProviderProps = {
  children: ReactNode;
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [musicVolume, setMusicVolumeState] = useState(DEFAULT_MUSIC_VOLUME);
  const [sfxVolume, setSfxVolumeState] = useState(DEFAULT_SFX_VOLUME);

  useEffect(() => {
    try {
      const storedMusicVolume = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);

      const storedSfxVolume = localStorage.getItem(STORAGE_KEYS.SFX_VOLUME);

      if (storedMusicVolume !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMusicVolumeState(Number(storedMusicVolume));
      }

      if (storedSfxVolume !== null) {
        setSfxVolumeState(Number(storedSfxVolume));
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(100, volume));

    setMusicVolumeState(clamped);

    localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, String(clamped));
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    const clamped = Math.max(0, Math.min(100, volume));

    setSfxVolumeState(clamped);

    localStorage.setItem(STORAGE_KEYS.SFX_VOLUME, String(clamped));
  }, []);

  const value = useMemo(
    () => ({
      musicVolume,
      sfxVolume,
      setMusicVolume,
      setSfxVolume,
    }),
    [musicVolume, sfxVolume, setMusicVolume, setSfxVolume],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};
