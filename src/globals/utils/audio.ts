const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playTone = (frequency: number, duration = 0.2) => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

  // Fade out to prevent clicking sounds
  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playWinMelody = async () => {
  const notes = [440, 554, 659, 880];
  for (const freq of notes) {
    playTone(freq, 0.15);
    await new Promise(r => setTimeout(r, 100));
  }
};

export const playLoseDissonance = () => {
  playTone(110, 0.8); 
  playTone(116, 0.8); 
  playTone(86, 0.8); 
};

export const BUTTON_FREQUENCIES: Record<string, number> = {
  green: 415,
  red: 310,
  yellow: 252,
  blue: 209,
};