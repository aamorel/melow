import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';

const MIN_CLARITY = 0.7;
const MIN_FREQUENCY = 65;
const MAX_FREQUENCY = 1200;
const SILENCE_RMS = 0.003;
const SMOOTHING_FACTOR = 0.18;
const FALLBACK_TIMEOUT_MS = 1200;

function calculateRms(buffer: Float32Array) {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

export function usePitchDetector() {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'listening' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [clarity, setClarity] = useState(0);
  const [rms, setRms] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<ReturnType<typeof PitchDetector.forFloat32Array> | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedPitchRef = useRef<number | null>(null);
  const lastValidRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const stopListening = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    detectorRef.current = null;
    bufferRef.current = null;
    smoothedPitchRef.current = null;
    pausedRef.current = false;
    setIsPaused(false);
    setFrequency(null);
    setClarity(0);
    setRms(0);
    setStatus('idle');
  }, []);

  const pauseListening = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resumeListening = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
    lastValidRef.current = performance.now();
  }, []);

  const startListening = useCallback(async () => {
    if (status === 'requesting' || status === 'listening') return;

    setStatus('requesting');
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const AudioContextConstructor = (window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as
        | typeof AudioContext
        | undefined;

      if (!AudioContextConstructor) {
        throw new Error('Web Audio API is not supported in this environment');
      }

      const audioContext = new AudioContextConstructor();
      await audioContext.resume();

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      const detector = PitchDetector.forFloat32Array(buffer.length);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      detectorRef.current = detector;
      bufferRef.current = buffer;
      streamRef.current = stream;
      smoothedPitchRef.current = null;
      lastValidRef.current = performance.now();

      const updatePitch = () => {
        if (!analyserRef.current || !detectorRef.current || !bufferRef.current || !audioContextRef.current) {
          return;
        }

        if (pausedRef.current) {
          setFrequency(null);
          setClarity(0);
          setRms(0);
          rafRef.current = requestAnimationFrame(updatePitch);
          return;
        }

        analyserRef.current.getFloatTimeDomainData(bufferRef.current);
        const nextRms = calculateRms(bufferRef.current);
        setRms(nextRms);

        const [pitch, pitchClarity] = detectorRef.current.findPitch(
          bufferRef.current,
          audioContextRef.current.sampleRate
        );
        setClarity(pitchClarity);

        const isPitchValid = pitchClarity >= MIN_CLARITY &&
          pitch >= MIN_FREQUENCY &&
          pitch <= MAX_FREQUENCY;
        const hasSignal = nextRms >= SILENCE_RMS;

        if (isPitchValid) {
          const previous = smoothedPitchRef.current ?? pitch;
          const smoothed = previous + (pitch - previous) * SMOOTHING_FACTOR;
          smoothedPitchRef.current = smoothed;
          if (hasSignal || smoothedPitchRef.current !== null) {
            setFrequency(smoothed);
          }
          lastValidRef.current = performance.now();
        } else if (performance.now() - lastValidRef.current > FALLBACK_TIMEOUT_MS) {
          setFrequency(null);
        } else if (smoothedPitchRef.current !== null) {
          setFrequency(smoothedPitchRef.current);
        }

        rafRef.current = requestAnimationFrame(updatePitch);
      };

      rafRef.current = requestAnimationFrame(updatePitch);
      setStatus('listening');
    } catch (error) {
      console.error('Failed to start pitch detection:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Microphone permission was denied.');
    }
  }, [status]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    status,
    errorMessage,
    frequency,
    clarity,
    rms,
    isPaused,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
  };
}
