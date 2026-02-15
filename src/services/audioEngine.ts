import type { Instrument } from '../types/game';
import { instrumentVoices, type AudioVoiceContext } from './audioInstruments';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.7;
  private hammerBuffer: AudioBuffer | null = null;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    const AudioContextConstructor = (window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
      | typeof AudioContext
      | undefined;

    if (!AudioContextConstructor) {
      throw new Error('Web Audio API is not supported in this environment');
    }

    this.audioContext = new AudioContextConstructor();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  async playNote(frequency: number, instrument: Instrument, duration = 1.0): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGain) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;
    const voiceContext = this.getVoiceContext();
    if (!voiceContext) return;
    instrumentVoices[instrument](voiceContext, frequency, duration, now);
  }

  async playChord(frequencies: number[], instrument: Instrument, duration = 1.2): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGain) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    if (frequencies.length === 0) return;

    const now = this.audioContext.currentTime;
    const chordGain = this.audioContext.createGain();
    const gainScale = 1 / Math.sqrt(Math.max(1, frequencies.length));
    chordGain.gain.setValueAtTime(gainScale, now);
    chordGain.connect(this.masterGain);
    const voiceContext = this.getVoiceContext();
    if (!voiceContext) return;

    frequencies.forEach((frequency) => {
      instrumentVoices[instrument](voiceContext, frequency, duration, now, chordGain);
    });
  }

  async playReferenceTone(frequency: number, duration = 1.1): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGain) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const now = this.audioContext.currentTime;

    const fundamental = this.audioContext.createOscillator();
    const overtone = this.audioContext.createOscillator();
    const fundamentalGain = this.audioContext.createGain();
    const overtoneGain = this.audioContext.createGain();

    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(frequency, now);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(frequency * 2, now);

    fundamentalGain.gain.setValueAtTime(0, now);
    fundamentalGain.gain.linearRampToValueAtTime(0.32, now + 0.02);
    fundamentalGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    overtoneGain.gain.setValueAtTime(0, now);
    overtoneGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    fundamental.connect(fundamentalGain);
    overtone.connect(overtoneGain);
    fundamentalGain.connect(this.masterGain);
    overtoneGain.connect(this.masterGain);

    fundamental.start(now);
    overtone.start(now);
    fundamental.stop(now + duration);
    overtone.stop(now + duration);
  }

  async playInterval(freq1: number, freq2: number, instrument: Instrument, gap = 0.1): Promise<void> {
    await this.playNote(freq1, instrument, 1.0);
    await new Promise(resolve => setTimeout(resolve, (1.0 + gap) * 1000));
    await this.playNote(freq2, instrument, 1.0);
  }

  private getVoiceContext(): AudioVoiceContext | null {
    if (!this.audioContext || !this.masterGain) return null;
    return {
      audioContext: this.audioContext,
      masterGain: this.masterGain,
      ensureHammerBuffer: () => this.ensureHammerBuffer(),
    };
  }

  private ensureHammerBuffer(): AudioBuffer | null {
    if (!this.audioContext) return null;
    if (this.hammerBuffer) return this.hammerBuffer;

    const length = Math.floor(this.audioContext.sampleRate * 0.03);
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i += 1) {
      const decay = 1 - i / length;
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    this.hammerBuffer = buffer;
    return buffer;
  }
}

export const audioEngine = new AudioEngine();
