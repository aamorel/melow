import type { Instrument } from '../types/game';
import { instrumentVoices, type AudioVoiceContext } from './audioInstruments';

const PLAYBACK_TAIL_MULTIPLIER = 1.8;
const PLAYBACK_CLEANUP_PADDING_MS = 150;
const PLAYBACK_STOP_FADE_SECONDS = 0.02;

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.7;
  private hammerBuffer: AudioBuffer | null = null;
  private activePlaybackBuses = new Set<GainNode>();

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
    const voiceContext = await this.preparePlayback();
    if (!voiceContext || !this.audioContext) return;

    this.beginPlayback();
    const playbackBus = this.createPlaybackBus();
    if (!playbackBus) return;

    const now = this.audioContext.currentTime;
    instrumentVoices[instrument](voiceContext, frequency, duration, now, playbackBus);
    this.scheduleBusCleanup(playbackBus, this.cleanupDurationMs(duration));
  }

  async playChord(frequencies: number[], instrument: Instrument, duration = 1.2): Promise<void> {
    const voiceContext = await this.preparePlayback();
    if (!voiceContext || !this.audioContext || frequencies.length === 0) return;

    this.beginPlayback();
    const playbackBus = this.createPlaybackBus();
    if (!playbackBus) return;

    const now = this.audioContext.currentTime;
    const chordGain = this.audioContext.createGain();
    const gainScale = 1 / Math.sqrt(Math.max(1, frequencies.length));
    chordGain.gain.setValueAtTime(gainScale, now);
    chordGain.connect(playbackBus);

    frequencies.forEach((frequency) => {
      instrumentVoices[instrument](voiceContext, frequency, duration, now, chordGain);
    });

    this.scheduleBusCleanup(playbackBus, this.cleanupDurationMs(duration));
  }

  async playReferenceTone(frequency: number, duration = 1.1): Promise<void> {
    const voiceContext = await this.preparePlayback();
    if (!voiceContext || !this.audioContext) return;

    this.beginPlayback();
    const playbackBus = this.createPlaybackBus();
    if (!playbackBus) return;

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
    fundamentalGain.connect(playbackBus);
    overtoneGain.connect(playbackBus);

    fundamental.start(now);
    overtone.start(now);
    fundamental.stop(now + duration);
    overtone.stop(now + duration);

    this.scheduleBusCleanup(playbackBus, this.cleanupDurationMs(duration));
  }

  async playInterval(freq1: number, freq2: number, instrument: Instrument, gap = 0.1): Promise<void> {
    const voiceContext = await this.preparePlayback();
    if (!voiceContext || !this.audioContext) return;

    this.beginPlayback();
    const playbackBus = this.createPlaybackBus();
    if (!playbackBus) return;

    const now = this.audioContext.currentTime;
    const noteDuration = 1.0;
    const secondNoteStart = now + noteDuration + gap;

    instrumentVoices[instrument](voiceContext, freq1, noteDuration, now, playbackBus);
    instrumentVoices[instrument](voiceContext, freq2, noteDuration, secondNoteStart, playbackBus);

    this.scheduleBusCleanup(playbackBus, this.cleanupDurationMs(noteDuration * 2 + gap));
  }

  async playScale(
    frequencies: number[],
    instrument: Instrument,
    noteDuration = 0.55,
    gap = 0.05
  ): Promise<void> {
    const voiceContext = await this.preparePlayback();
    if (!voiceContext || !this.audioContext || frequencies.length === 0) return;

    this.beginPlayback();
    const playbackBus = this.createPlaybackBus();
    if (!playbackBus) return;

    const now = this.audioContext.currentTime;
    frequencies.forEach((frequency, index) => {
      const startTime = now + index * (noteDuration + gap);
      instrumentVoices[instrument](voiceContext, frequency, noteDuration, startTime, playbackBus);
    });

    const totalDuration = (noteDuration * frequencies.length) + (gap * Math.max(0, frequencies.length - 1));
    this.scheduleBusCleanup(playbackBus, this.cleanupDurationMs(totalDuration));
  }

  private async preparePlayback(): Promise<AudioVoiceContext | null> {
    if (!this.audioContext || !this.masterGain) {
      await this.initialize();
    }

    if (!this.audioContext || !this.masterGain) return null;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    return this.getVoiceContext();
  }

  private beginPlayback(): void {
    this.stopActivePlayback();
  }

  private stopActivePlayback(): void {
    if (this.activePlaybackBuses.size === 0) return;

    if (!this.audioContext) {
      this.activePlaybackBuses.clear();
      return;
    }

    const now = this.audioContext.currentTime;
    this.activePlaybackBuses.forEach((bus) => {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.linearRampToValueAtTime(0.0001, now + PLAYBACK_STOP_FADE_SECONDS);
      window.setTimeout(() => {
        try {
          bus.disconnect();
        } catch {
          // Ignore disconnect errors if already detached.
        }
      }, (PLAYBACK_STOP_FADE_SECONDS * 1000) + 20);
    });
    this.activePlaybackBuses.clear();
  }

  private createPlaybackBus(): GainNode | null {
    if (!this.audioContext || !this.masterGain) return null;
    const playbackBus = this.audioContext.createGain();
    playbackBus.gain.setValueAtTime(1, this.audioContext.currentTime);
    playbackBus.connect(this.masterGain);
    this.activePlaybackBuses.add(playbackBus);
    return playbackBus;
  }

  private scheduleBusCleanup(playbackBus: GainNode, durationMs: number): void {
    window.setTimeout(() => {
      try {
        playbackBus.disconnect();
      } catch {
        // Ignore disconnect errors if already detached.
      }
      this.activePlaybackBuses.delete(playbackBus);
    }, durationMs);
  }

  private cleanupDurationMs(durationSeconds: number): number {
    return Math.ceil(durationSeconds * 1000 * PLAYBACK_TAIL_MULTIPLIER + PLAYBACK_CLEANUP_PADDING_MS);
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
