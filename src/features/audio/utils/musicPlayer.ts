type PlayMusicOptions = {
  loop?: boolean;
  volume?: number;
};

class MusicPlayer {
  private cache = new Map<string, HTMLAudioElement>();
  private currentMusic: HTMLAudioElement | null = null;

  /**
   * Preload music into memory.
   */
  load(src: string) {
    if (this.cache.has(src)) return;

    const audio = new Audio(src);

    audio.preload = "auto";

    this.cache.set(src, audio);
  }

  /**
   * Get cached music instance.
   */
  getAudio(src: string) {
    if (!this.cache.has(src)) {
      this.load(src);
    }

    return this.cache.get(src)!;
  }

  /**
   * Play background music.
   */
  play(src: string, options: PlayMusicOptions = {}) {
    const { loop = true, volume = 0.5 } = options;

    const audio = this.getAudio(src);

    // Prevent restarting same music
    if (this.currentMusic === audio && !audio.paused) {
      return;
    }

    // Stop currently playing music
    if (this.currentMusic && this.currentMusic !== audio) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
    }

    audio.loop = loop;
    audio.volume = volume;

    this.currentMusic = audio;

    void audio.play().catch(() => {
      console.warn("Failed to play music.");
    });
  }

  /**
   * Stop currently playing music.
   */
  stop() {
    if (!this.currentMusic) return;

    this.currentMusic.pause();
    this.currentMusic.currentTime = 0;

    this.currentMusic = null;
  }

  /**
   * Pause music.
   */
  pause() {
    this.currentMusic?.pause();
  }

  /**
   * Resume paused music.
   */
  resume() {
    if (!this.currentMusic) return;

    void this.currentMusic.play().catch(() => {
      console.warn("Failed to resume music.");
    });
  }

  /**
   * Change music volume.
   */
  setVolume(volume: number) {
    if (!this.currentMusic) return;

    this.currentMusic.volume = volume;
  }

  /**
   * Check if music is currently playing.
   */
  isPlaying() {
    return !!this.currentMusic && !this.currentMusic.paused;
  }
}

export const musicPlayer = new MusicPlayer();