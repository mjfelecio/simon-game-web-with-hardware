let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

interface ToneOptions {
  duration?: number;
  type?: OscillatorType;
  volume?: number;
}

export const playTone = (frequency: number, options: ToneOptions = {}) => {
  const { duration = 0.2, type = "sine", volume = 0.5 } = options;
  const ctx = getAudioCtx();
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Envelope: Start at volume, ramp down to near-zero to prevent popping/clicking
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

export const playWinMelody = async () => {
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Arpeggio (C5, E5, G5, C6)
  for (const freq of notes) {
    playTone(freq, { duration: 0.15, type: "sine" });
    await new Promise(r => setTimeout(r, 120));
  }
};

export const playLoseDissonance = () => {
  // Low, clashing frequencies for that "incorrect" arcade feel
  playTone(110, { duration: 0.6, type: "sawtooth", volume: 0.3 }); 
  playTone(116, { duration: 0.6, type: "sawtooth", volume: 0.3 }); 
};

export const BUTTON_FREQUENCIES: Record<string, number> = {
  green: 523.25,  // C5
  red: 392.00,    // G4
  yellow: 329.63, // E4
  blue: 261.63,   // C4
};