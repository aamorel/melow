import type { Instrument } from '../types/game';

const PIANO_DECAY_MULTIPLIER = 1.6;

export interface AudioVoiceContext {
  audioContext: AudioContext;
  masterGain: GainNode;
  ensureHammerBuffer: () => AudioBuffer | null;
}

type InstrumentVoice = (
  context: AudioVoiceContext,
  frequency: number,
  duration: number,
  startTime: number,
  destination?: AudioNode,
) => void;

const playPiano: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const mixGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  mixGain.gain.setValueAtTime(0.0001, startTime);
  mixGain.gain.linearRampToValueAtTime(0.9, startTime + 0.004);
  const tailDuration = duration * PIANO_DECAY_MULTIPLIER;
  mixGain.gain.exponentialRampToValueAtTime(0.0001, startTime + tailDuration);

  filter.type = 'lowpass';
  const brightCutoff = Math.min(12000, Math.max(1500, frequency * 12));
  const bodyCutoff = Math.min(6000, Math.max(1200, frequency * 5));
  filter.frequency.setValueAtTime(brightCutoff, startTime);
  filter.frequency.exponentialRampToValueAtTime(bodyCutoff, startTime + 0.08);
  filter.Q.setValueAtTime(0.8, startTime);

  mixGain.connect(filter);
  filter.connect(output);

  const partials = [
    { multiple: 1, amplitude: 0.25, detune: -3 },
    { multiple: 1, amplitude: 0.23, detune: 3 },
    { multiple: 2, amplitude: 0.14, detune: 0 },
    { multiple: 3, amplitude: 0.09, detune: -2 },
    { multiple: 4, amplitude: 0.06, detune: 2 },
    { multiple: 5, amplitude: 0.04, detune: 0 },
  ];

  partials.forEach(({ multiple, amplitude, detune }) => {
    const oscillator = audioContext.createOscillator();
    const partialGain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency * multiple, startTime);
    oscillator.detune.setValueAtTime(detune, startTime);
    partialGain.gain.setValueAtTime(amplitude, startTime);

    oscillator.connect(partialGain);
    partialGain.connect(mixGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + tailDuration);
  });

  const hammerBuffer = context.ensureHammerBuffer();
  if (hammerBuffer) {
    const hammerNoise = audioContext.createBufferSource();
    const noiseFilter = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();

    hammerNoise.buffer = hammerBuffer;
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(Math.min(8000, frequency * 4), startTime);

    noiseGain.gain.setValueAtTime(0.0001, startTime);
    noiseGain.gain.linearRampToValueAtTime(0.08, startTime + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

    hammerNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(filter);

    hammerNoise.start(startTime);
    hammerNoise.stop(startTime + 0.035);
  }
};

const playSaxophone: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const oscillator = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(frequency * 2, startTime);
  filter.Q.setValueAtTime(1, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
  gainNode.gain.setValueAtTime(0.35, startTime + duration * 0.8);
  gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(output);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playGuitar: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.005);
  gainNode.gain.exponentialRampToValueAtTime(0.1, startTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(output);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playFlute: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.1);
  gainNode.gain.setValueAtTime(0.2, startTime + duration * 0.9);
  gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(output);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playViolin: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.2);
  gainNode.gain.setValueAtTime(0.25, startTime + duration * 0.8);
  gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(output);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

const playVoice: InstrumentVoice = (context, frequency, duration, startTime, destination) => {
  const { audioContext } = context;
  const output = destination ?? context.masterGain;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const vibrato = audioContext.createOscillator();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5, startTime);
  const vibratoGain = audioContext.createGain();
  vibratoGain.gain.setValueAtTime(3, startTime);
  vibrato.connect(vibratoGain);
  vibratoGain.connect(oscillator.frequency);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.12);
  gainNode.gain.setValueAtTime(0.3, startTime + duration * 0.7);
  gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(output);

  oscillator.start(startTime);
  vibrato.start(startTime);
  oscillator.stop(startTime + duration);
  vibrato.stop(startTime + duration);
};

export const instrumentVoices: Record<Instrument, InstrumentVoice> = {
  piano: playPiano,
  saxophone: playSaxophone,
  guitar: playGuitar,
  flute: playFlute,
  violin: playViolin,
  voice: playVoice,
};
