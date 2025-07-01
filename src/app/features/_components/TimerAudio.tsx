'use client';

import { useEffect, useRef, useState } from 'react';
import { type TimerPhase } from './useIntervalTimer';

interface TimerAudioProps {
  volume?: number;
  muted?: boolean;
}

export default function TimerAudio({ 
  volume = 0.7, 
  muted = false 
}: TimerAudioProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        setIsAudioEnabled(true);
      }
    };

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  const playBeep = (frequency: number, duration: number, type: 'work' | 'rest' | 'complete' = 'work') => {
    if (!audioContextRef.current || muted || !isAudioEnabled) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);

    // Add different patterns based on type
    if (type === 'complete') {
      // Double beep for completion
      setTimeout(() => {
        if (audioContextRef.current && !muted) {
          const osc2 = audioContextRef.current.createOscillator();
          const gain2 = audioContextRef.current.createGain();
          
          osc2.connect(gain2);
          gain2.connect(audioContextRef.current.destination);
          
          osc2.frequency.setValueAtTime(frequency * 1.5, audioContextRef.current.currentTime);
          osc2.type = 'sine';
          
          gain2.gain.setValueAtTime(0, audioContextRef.current.currentTime);
          gain2.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.01);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
          
          osc2.start(audioContextRef.current.currentTime);
          osc2.stop(audioContextRef.current.currentTime + duration);
        }
      }, 200);
    }
  };


  return null; // This component doesn't render anything visible
}