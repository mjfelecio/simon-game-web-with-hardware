import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

import { musicPlayer } from "@/features/audio/utils/musicPlayer";

type PlayMusicOptions = {
  volume?: number;
  loop?: boolean;
  fadeDuration?: number;
};

type MusicContextValue = {
  playMusic: (src: string, options?: PlayMusicOptions) => Promise<void>;
  stopMusic: () => Promise<void>;
  setVolume: (volume: number) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function MusicProvider({ children }: Props) {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);

  /**
   * Smoothly fades audio volume.
   */
  const fadeVolume = useCallback(
    (audio: HTMLAudioElement, from: number, to: number, duration: number) => {
      return new Promise<void>((resolve) => {
        try {
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            audio.volume = Math.max(from + (to - from) * progress, 0);

            if (progress < 1) {
              fadeFrameRef.current = requestAnimationFrame(tick);
            } else {
              resolve();
            }
          };
          fadeFrameRef.current = requestAnimationFrame(tick);
        } catch (error) {
          console.warn("MusicProvider: " + error);
        }
      });
    },
    [],
  );

  /**
   * Play music with crossfade.
   */
  const playMusic = useCallback(
    async (src: string, options: PlayMusicOptions = {}) => {
      const { volume = 0.5, loop = true, fadeDuration = 500 } = options;

      const nextAudio = musicPlayer.getAudio(src);

      // Prevent restarting same track
      if (currentAudioRef.current === nextAudio) {
        return;
      }

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

      // Fade in next music
      await fadeVolume(nextAudio, 0, volume, fadeDuration);

      // Fade out previous music
      if (previousAudio) {
        await fadeVolume(previousAudio, previousAudio.volume, 0, fadeDuration);

        previousAudio.pause();
        previousAudio.currentTime = 0;
      }
    },
    [fadeVolume],
  );

  /**
   * Stop current music with fade out.
   */
  const stopMusic = useCallback(async () => {
    const current = currentAudioRef.current;

    if (!current) return;

    await fadeVolume(current, current.volume, 0, 400);

    current.pause();
    current.currentTime = 0;

    currentAudioRef.current = null;
  }, [fadeVolume]);

  /**
   * Change current music volume.
   */
  const setVolume = useCallback((volume: number) => {
    if (!currentAudioRef.current) return;

    currentAudioRef.current.volume = volume;
  }, []);

  useEffect(() => {
    return () => {
      if (fadeFrameRef.current) {
        cancelAnimationFrame(fadeFrameRef.current);
      }
    };
  }, []);

  return (
    <MusicContext.Provider
      value={{
        playMusic,
        stopMusic,
        setVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
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
