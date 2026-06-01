import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { musicPlayer } from "@/features/audio/utils/musicPlayer";
import { useSettings } from "@/globals/providers/SettingsProvider";

type PlayMusicOptions = {
  volume?: number;
  loop?: boolean;
  fadeDuration?: number;
};

type MusicContextValue = {
  playMusic: (src: string, options?: PlayMusicOptions) => Promise<void>;
  stopMusic: () => Promise<void>;
  isPlaying: () => boolean;
  fadeToVolume: (to: number) => void;
  getEffectiveVolume: () => number;
};

const MusicContext = createContext<MusicContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function MusicProvider({ children }: Props) {
  const { musicVolume } = useSettings();

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);

  /**
   * Track-specific volume override.
   *
   * Example:
   * - Settings volume = 80%
   * - Track volume override = 0.5
   * - Actual volume = 0.4
   */
  const volumeMultiplierRef = useRef(1);

  const getEffectiveVolume = useCallback(() => {
    return (musicVolume / 100) * volumeMultiplierRef.current;
  }, [musicVolume]);

  const fadeVolume = useCallback(
    (audio: HTMLAudioElement, from: number, to: number, duration: number) => {
      return new Promise<void>((resolve) => {
        const start = performance.now();

        const tick = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);

          audio.volume = Math.min(Math.max(from + (to - from) * progress, 0), 1);
          // audio.volume = Math.max(from + (to - from) * progress, 0);

          if (progress < 1) {
            fadeFrameRef.current = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        fadeFrameRef.current = requestAnimationFrame(tick);
      });
    },
    [],
  );

  const fadeToVolume = useCallback((to: number) => {
    const current = currentAudioRef.current
    if (!current) return;
    fadeVolume(current, current?.volume, to, 500)
  }, [fadeVolume])

  const playMusic = useCallback(
    async (src: string, options: PlayMusicOptions = {}) => {
      const { volume, loop = true, fadeDuration = 500 } = options;

      const nextAudio = musicPlayer.getAudio(src);

      if (currentAudioRef.current === nextAudio) {
        return;
      }

      volumeMultiplierRef.current = volume ?? 1;

      const targetVolume = (musicVolume / 100) * volumeMultiplierRef.current;

      nextAudio.loop = loop;
      nextAudio.volume = 0;

      try {
        await nextAudio.play();
      } catch {
        console.warn("Autoplay blocked.");
        return;
      }

      const previousAudio = currentAudioRef.current;

      currentAudioRef.current = nextAudio;

      await fadeVolume(nextAudio, 0, targetVolume, fadeDuration);

      if (previousAudio) {
        await fadeVolume(previousAudio, previousAudio.volume, 0, fadeDuration);

        previousAudio.pause();
        previousAudio.currentTime = 0;
      }
    },
    [fadeVolume, musicVolume],
  );

  const stopMusic = useCallback(async () => {
    const current = currentAudioRef.current;

    if (!current) {
      return;
    }

    await fadeVolume(current, current.volume, 0, 400);

    current.pause();
    current.currentTime = 0;

    currentAudioRef.current = null;
  }, [fadeVolume]);

  /**
   * Automatically react to settings changes.
   */
  useEffect(() => {
    const current = currentAudioRef.current;
    if (!current) return;

    current.volume = getEffectiveVolume();
  }, [musicVolume, getEffectiveVolume]);

  useEffect(() => {
    return () => {
      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
      }
    };
  }, []);

  const isPlaying = useCallback(() => {
    return !!currentAudioRef.current && !currentAudioRef.current.paused;
  }, []);

  const value = useMemo(
    () => ({
      playMusic,
      stopMusic,
      isPlaying,
      fadeToVolume,
      getEffectiveVolume
    }),
    [playMusic, stopMusic, isPlaying, fadeToVolume, getEffectiveVolume],
  );

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error("useMusic must be used within MusicProvider");
  }

  return context;
}
