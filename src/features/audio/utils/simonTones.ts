import { delay } from "@/globals/utils";

let audioCtx: AudioContext | null = null;
let sfxVolumeMultiplier = 1;

export const BUTTON_FREQUENCIES: Record<string, number> = {
  green: 523.25, // C5
  red: 392.0, // G4
  yellow: 329.63, // E4
  blue: 261.63, // C4
};

interface ToneOptions {
  duration?: number;
  type?: OscillatorType;
  volume?: number;
}

const getAudioCtx = () => {
  if (!audioCtx)
    audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

export const setToneVolumeMultiplier = (volume: number) => {
  sfxVolumeMultiplier = volume;
};

export const playTone = (frequency: number, options: ToneOptions = {}) => {
  const { duration = 0.2, type = "sine", volume = 0.5 } = options;
  const ctx = getAudioCtx();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Envelope: Start at volume, ramp down to near-zero to prevent popping/clicking
  gainNode.gain.setValueAtTime(volume * sfxVolumeMultiplier, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
};

export const playWinMelody = async () => {
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C Major Arpeggio (C5, E5, G5, C6)
  for (const freq of notes) {
    playTone(freq, { duration: 0.15, type: "sine" });
    await new Promise((r) => setTimeout(r, 120));
  }
};

export const playVictoryTone = async () => {
  const melody = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    1046.5, // C6
    1318.5, // E6
    1567.98, // G6
  ];

  for (const freq of melody) {
    playTone(freq, {
      duration: 0.1,
      type: "square",
      volume: 0.55,
    });

    await delay(100);
  }

  // Hero chord
  [
    523.25, // C
    659.25, // E
    783.99, // G
    1046.5, // C
    1318.5, // E
  ].forEach((freq) =>
    playTone(freq, {
      duration: 2.5,
      type: "square",
      volume: 0.4,
    }),
  );
};

export const playLoseTone = async () => {
  const notes = [
    440,
    392,
    349,
    293,
    246,
    196,
    146,
  ];

  for (const freq of notes) {
    playTone(freq, {
      duration: 0.5,
      type: "square",
      volume: 0.45,
    });

    await delay(200);
  }
  
  // final doom chord
  [110, 116, 123].forEach((freq) =>
    playTone(freq, {
      duration: 3,
      type: "square",
      volume: 0.5,
    }),
  );
};