type PlaySfxOptions = {
  volume?: number;
  playbackRate?: number;
};

class SfxPlayer {
  private cache = new Map<string, HTMLAudioElement[]>();

  private volumeMultiplier = 1;

  setVolumeMultiplier(volume: number) {
    this.volumeMultiplier = volume;
  }

  /**
   * Preload a sound into memory.
   */
  load(src: string, poolSize = 5) {
    if (this.cache.has(src)) return;

    const pool: HTMLAudioElement[] = [];

    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(src);
      audio.preload = "auto";

      pool.push(audio);
    }

    this.cache.set(src, pool);
  }

  /**
   * Play a sound effect.
   */
  play(src: string, options: PlaySfxOptions = {}) {
    const { volume = 1, playbackRate = 1 } = options;

    // Auto-load if not yet cached
    if (!this.cache.has(src)) {
      this.load(src);
    }

    const pool = this.cache.get(src);

    if (!pool) return;

    // Find available audio instance
    const audio = pool.find((a) => a.paused || a.ended) ?? pool[0];

    audio.currentTime = 0;

    audio.volume = Math.min(Math.max(volume * this.volumeMultiplier, 0), 1);

    audio.playbackRate = playbackRate;

    void audio.play().catch(() => {
      console.warn("Failed to play sfx.");
    });
  }
}

export const sfxPlayer = new SfxPlayer();
