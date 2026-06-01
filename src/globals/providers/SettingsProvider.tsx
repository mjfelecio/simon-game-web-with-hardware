import { sfxPlayer } from "@/features/audio/utils/sfxPlayer";
import { setToneVolumeMultiplier } from "@/features/audio/utils/simonTones";
import { DEFAULT_KEY_MAP, type KeyMap } from "@/features/controllers/constants";
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
  keyMap: KeyMap;

  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setKeyMap: (keymap: KeyMap) => void;
};

const STORAGE_KEYS = {
  MUSIC_VOLUME: "simon-settings-music-volume",
  SFX_VOLUME: "simon-settings-sfx-volume",
  KEY_MAP: "simon-settings-key-map",
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
  const [keyMap, setKeyMapState] = useState<KeyMap>(DEFAULT_KEY_MAP);

  useEffect(() => {
    try {
      const storedMusicVolume = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
      const storedSfxVolume = localStorage.getItem(STORAGE_KEYS.SFX_VOLUME);
      const storedKeyMap = localStorage.getItem(STORAGE_KEYS.KEY_MAP);

      if (storedMusicVolume !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMusicVolumeState(Number(storedMusicVolume));
      }

      if (storedSfxVolume !== null) {
        setSfxVolumeState(Number(storedSfxVolume));
      }

      if (storedKeyMap !== null) {
        setKeyMapState(JSON.parse(storedKeyMap));
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  }, []);

  // Just putting it here for simplicity sake
  useEffect(() => {
    sfxPlayer.setVolumeMultiplier(sfxVolume / 100);
    setToneVolumeMultiplier(sfxVolume / 100);
  }, [sfxVolume]);

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

  const setKeyMap = useCallback((keymap: KeyMap) => {
    setKeyMapState(keymap);

    localStorage.setItem(STORAGE_KEYS.KEY_MAP, JSON.stringify(keymap));
  }, []);

  const value = useMemo(
    () => ({
      musicVolume,
      sfxVolume,
      keyMap,
      setMusicVolume,
      setSfxVolume,
      setKeyMap,
    }),
    [musicVolume, sfxVolume, keyMap, setMusicVolume, setSfxVolume, setKeyMap],
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
