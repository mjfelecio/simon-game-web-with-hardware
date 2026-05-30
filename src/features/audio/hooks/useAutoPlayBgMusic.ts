import { useEffect } from "react";
import { musicPlayer } from "@/features/audio/utils/musicPlayer";
import { useMusic } from "@/features/audio/components/MusicProvider";
import { MUSIC } from "@/features/audio/constants/music";

/**
 * "Autoplays" music when it detects the registered window events
 *
 * @param src music url path
 */
export default function useAutoPlayBgMusic() {
  const { playMusic, isPlaying } = useMusic();

  useEffect(() => {
    const play = async () => {
      if (!isPlaying()) {
        playMusic(MUSIC.BG, {
          volume: 0.1,
          loop: true,
        });
      }

      window.removeEventListener("click", play);
      window.removeEventListener("keydown", play);
      window.removeEventListener("touchstart", play);
    };

    window.addEventListener("click", play);
    window.addEventListener("keydown", play);
    window.addEventListener("touchstart", play);

    return () => {
      musicPlayer.stop();
      window.removeEventListener("click", play);
      window.removeEventListener("keydown", play);
      window.removeEventListener("touchstart", play);
    };
  }, [playMusic, isPlaying]);
}
