'use client';

import { useEffect, useRef, useState } from 'react';

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



  return null; // This component doesn't render anything visible
}