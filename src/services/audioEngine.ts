import type { Instrument } from '../types/game';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume = 0.7;

  async initialize(): Promise<void> {
    if (this.audioContext) return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

    const now = this.audioContext.currentTime;
    
    switch (instrument) {
      case 'piano':
        this.playPiano(frequency, duration, now);
        break;
      case 'saxophone':
        this.playSaxophone(frequency, duration, now);
        break;
      case 'guitar':
        this.playGuitar(frequency, duration, now);
        break;
      case 'flute':
        this.playFlute(frequency, duration, now);
        break;
      case 'violin':
        this.playViolin(frequency, duration, now);
        break;
    }
  }

  private playPiano(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Piano-like envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playSaxophone(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext || !this.masterGain) return;

    // Saxophone uses sawtooth wave with filter for warmth
    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(frequency * 2, startTime);
    filter.Q.setValueAtTime(1, startTime);

    // Saxophone-like envelope with slight attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
    gainNode.gain.setValueAtTime(0.35, startTime + duration * 0.8);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playGuitar(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Guitar-like envelope with quick attack and decay
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.1, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playFlute(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Flute-like envelope with gentle attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.1);
    gainNode.gain.setValueAtTime(0.2, startTime + duration * 0.9);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playViolin(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Violin-like envelope with smooth attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.2);
    gainNode.gain.setValueAtTime(0.25, startTime + duration * 0.8);
    gainNode.gain.linearRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  async playInterval(freq1: number, freq2: number, instrument: Instrument, gap = 0.1): Promise<void> {
    await this.playNote(freq1, instrument, 1.0);
    await new Promise(resolve => setTimeout(resolve, (1.0 + gap) * 1000));
    await this.playNote(freq2, instrument, 1.0);
  }
}

export const audioEngine = new AudioEngine();