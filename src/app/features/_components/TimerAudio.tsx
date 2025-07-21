"use client";

import { useEffect, useRef } from "react";

interface TimerAudioProps {
  volume?: number;
  muted?: boolean;
}

export default function TimerAudio({
  volume: _volume = 0.7,
  muted: _muted = false,
}: TimerAudioProps) {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      audioContextRef.current ??= new (window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    };

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}
