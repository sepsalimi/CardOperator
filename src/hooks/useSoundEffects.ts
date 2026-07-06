import { useCallback, useEffect, useRef, useState } from 'react';

const SOUND_KEY = 'card-operator:sound-muted:v1';

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

function loadMutedPreference(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMutedPreference(muted: boolean): void {
  try {
    window.localStorage.setItem(SOUND_KEY, String(muted));
  } catch {
    // Sound still works when storage is unavailable, but the preference is session-only.
  }
}

interface ToneOptions {
  frequency: number;
  endFrequency?: number;
  start?: number;
  duration: number;
  volume?: number;
  type?: OscillatorType;
}

export function useSoundEffects() {
  const [muted, setMuted] = useState(loadMutedPreference);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => () => void contextRef.current?.close(), []);

  const getContext = useCallback(() => {
    if (muted) return null;
    const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!AudioContextClass) return null;
    const context = contextRef.current ?? new AudioContextClass();
    contextRef.current = context;
    if (context.state === 'suspended') void context.resume();
    return context;
  }, [muted]);

  const playTones = useCallback(
    (tones: ToneOptions[]) => {
      const context = getContext();
      if (!context) return;
      const now = context.currentTime;

      tones.forEach(
        ({ frequency, endFrequency, start = 0, duration, volume = 0.07, type = 'sine' }) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const beginsAt = now + start;
          const endsAt = beginsAt + duration;

          oscillator.type = type;
          oscillator.frequency.setValueAtTime(frequency, beginsAt);
          if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, endsAt);
          gain.gain.setValueAtTime(0.0001, beginsAt);
          gain.gain.exponentialRampToValueAtTime(volume, beginsAt + Math.min(0.025, duration / 3));
          gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);
          oscillator.connect(gain).connect(context.destination);
          oscillator.start(beginsAt);
          oscillator.stop(endsAt + 0.01);
        },
      );
    },
    [getContext],
  );

  const playPlace = useCallback(
    () =>
      playTones([
        { frequency: 260, endFrequency: 510, duration: 0.13, volume: 0.06 },
        { frequency: 430, endFrequency: 720, start: 0.045, duration: 0.12, volume: 0.045 },
      ]),
    [playTones],
  );

  const playCorrect = useCallback(
    () =>
      playTones([
        { frequency: 523.25, start: 0, duration: 0.22, volume: 0.055 },
        { frequency: 659.25, start: 0.07, duration: 0.24, volume: 0.06 },
        { frequency: 783.99, start: 0.14, duration: 0.27, volume: 0.065 },
        { frequency: 1046.5, start: 0.23, duration: 0.34, volume: 0.055 },
      ]),
    [playTones],
  );

  const playWrong = useCallback(
    () =>
      playTones([
        { frequency: 230, endFrequency: 145, duration: 0.28, volume: 0.05, type: 'triangle' },
        { frequency: 115, endFrequency: 90, start: 0.04, duration: 0.3, volume: 0.025 },
      ]),
    [playTones],
  );

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      saveMutedPreference(next);
      return next;
    });
  }, []);

  return { muted, toggleMuted, playPlace, playCorrect, playWrong };
}
