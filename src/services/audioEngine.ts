import type { Instrument } from '../types/game';

const PIANO_DECAY_MULTIPLIER = 1.6;

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
      case 'voice':
        this.playVoice(frequency, duration, now);
        break;
    }
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

    frequencies.forEach((frequency) => {
      switch (instrument) {
        case 'piano':
          this.playPiano(frequency, duration, now, chordGain);
          break;
        case 'saxophone':
          this.playSaxophone(frequency, duration, now, chordGain);
          break;
        case 'guitar':
          this.playGuitar(frequency, duration, now, chordGain);
          break;
        case 'flute':
          this.playFlute(frequency, duration, now, chordGain);
          break;
        case 'violin':
          this.playViolin(frequency, duration, now, chordGain);
          break;
        case 'voice':
          this.playVoice(frequency, duration, now, chordGain);
          break;
      }
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

  private playPiano(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

    const mixGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

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
      const oscillator = this.audioContext!.createOscillator();
      const partialGain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency * multiple, startTime);
      oscillator.detune.setValueAtTime(detune, startTime);
      partialGain.gain.setValueAtTime(amplitude, startTime);

      oscillator.connect(partialGain);
      partialGain.connect(mixGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + tailDuration);
    });

    const hammerBuffer = this.ensureHammerBuffer();
    if (hammerBuffer) {
      const hammerNoise = this.audioContext.createBufferSource();
      const noiseFilter = this.audioContext.createBiquadFilter();
      const noiseGain = this.audioContext.createGain();

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
  }

  private playSaxophone(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

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
    gainNode.connect(output);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playGuitar(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

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
    gainNode.connect(output);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playFlute(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

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
    gainNode.connect(output);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playViolin(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

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
    gainNode.connect(output);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playVoice(frequency: number, duration: number, startTime: number, destination?: AudioNode): void {
    if (!this.audioContext || !this.masterGain) return;
    const output = destination ?? this.masterGain;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const vibrato = this.audioContext.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Simple vibrato for a more vocal character
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(5, startTime);
    const vibratoGain = this.audioContext.createGain();
    vibratoGain.gain.setValueAtTime(3, startTime); // cents offset approx
    vibrato.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);

    // Smooth voice-like envelope
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
  }

  async playInterval(freq1: number, freq2: number, instrument: Instrument, gap = 0.1): Promise<void> {
    await this.playNote(freq1, instrument, 1.0);
    await new Promise(resolve => setTimeout(resolve, (1.0 + gap) * 1000));
    await this.playNote(freq2, instrument, 1.0);
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
