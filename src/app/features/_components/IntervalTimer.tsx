"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useIntervalTimer,
  type TimerConfig,
  type TimerPhase,
} from "./useIntervalTimer";
import TimerConfiguration from "./TimerConfig";

export default function IntervalTimer() {
  const [currentConfig, setCurrentConfig] = useState<TimerConfig | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const defaultConfig = {
    workoutName: "Emil's Sub-max Daily Fingerboard",
    exercises: [
      {
        name: "Isometric Hang",
        sets: 1,
        reps: 6,
        workDuration: 10,
        restDuration: 20,
      },
      {
        name: "Isometric Hang: Front 3 Open",
        sets: 1,
        reps: 6,
        workDuration: 10,
        restDuration: 20,
      },
      {
        name: "Isometric Hang: Front 2 Open",
        sets: 1,
        reps: 2,
        workDuration: 10,
        restDuration: 20,
      },
      {
        name: "Isometric Hang: Middle 2 Open",
        sets: 1,
        reps: 2,
        workDuration: 10,
        restDuration: 20,
      },
      {
        name: "Isometric Hang: Front 2 Half Crimp",
        sets: 1,
        reps: 2,
        workDuration: 10,
        restDuration: 20,
      },
      {
        name: "Isometric Hang: Middle 2 Half Crimp",
        sets: 1,
        reps: 2,
        workDuration: 10,
        restDuration: 20,
      },
    ],
  };

  const timer = useIntervalTimer(currentConfig ?? defaultConfig);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        setIsAudioEnabled(true);
      }
    };

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

  const playBeep = useCallback(
    (
      frequency: number,
      duration: number,
      _type: "work" | "rest" | "complete" = "work",
    ) => {
      if (!audioContextRef.current || isMuted || !isAudioEnabled) return;

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        audioContextRef.current.currentTime,
      );
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.7,
        audioContextRef.current.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContextRef.current.currentTime + duration,
      );

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    },
    [isMuted, isAudioEnabled],
  );

  // Set up audio callbacks
  useEffect(() => {
    timer.setOnPhaseChange((phase: TimerPhase) => {
      switch (phase) {
        case "work":
          playBeep(800, 0.2, "work");
          break;
        case "rest":
          playBeep(400, 0.3, "rest");
          break;
        case "setBreak":
          playBeep(600, 0.4, "rest");
          break;
      }
    });

    timer.setOnComplete(() => {
      playBeep(1000, 0.5, "complete");
    });
  }, [playBeep, timer]);

  const handleStartTimer = (config: TimerConfig) => {
    setCurrentConfig(config);
    setShowConfig(false);
    // Start the timer immediately after config is set
    setTimeout(() => {
      timer.start();
    }, 50);
  };

  const handleBackToConfig = () => {
    timer.reset();
    setShowConfig(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getPhaseDisplay = (phase: TimerPhase) => {
    switch (phase) {
      case "work":
        return {
          label: "WORK",
          color: "text-red-400",
          bgColor: "from-red-900/30 to-red-800/20",
        };
      case "rest":
        return {
          label: "REST",
          color: "text-blue-400",
          bgColor: "from-blue-900/30 to-blue-800/20",
        };
      case "setBreak":
        return {
          label: "SET BREAK",
          color: "text-purple-400",
          bgColor: "from-purple-900/30 to-purple-800/20",
        };
      default:
        return {
          label: "READY",
          color: "text-emerald-400",
          bgColor: "from-emerald-900/30 to-emerald-800/20",
        };
    }
  };

  const phaseDisplay = getPhaseDisplay(timer.status.phase);

  // Calculate progress percent based on current phase
  const getProgressPercent = () => {
    if (!currentConfig || !timer.status.currentExercise) return 0;

    const currentExercise = timer.status.currentExercise;
    let totalDuration: number;
    switch (timer.status.phase) {
      case "work":
        totalDuration = currentExercise.workDuration;
        break;
      case "rest":
        totalDuration = currentExercise.restDuration;
        break;
      case "setBreak":
        totalDuration = currentExercise.restDuration * 2; // Longer break between sets
        break;
      default:
        totalDuration = currentExercise.workDuration;
    }

    return ((totalDuration - timer.status.timeRemaining) / totalDuration) * 100;
  };

  const progressPercent = getProgressPercent();

  if (showConfig) {
    return (
      <TimerConfiguration
        onStartTimer={handleStartTimer}
        initialConfig={currentConfig ?? undefined}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center"
      >
        <div className="flex items-center justify-between sm:flex-1 sm:justify-start">
          <button
            onClick={handleBackToConfig}
            className="flex items-center rounded-lg bg-emerald-800/40 px-3 py-2 text-sm text-emerald-200 transition-colors hover:bg-emerald-700/50 sm:px-4"
          >
            <svg
              className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Back to Setup</span>
            <span className="sm:hidden">Back</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`rounded-lg p-2 transition-colors ${
              isMuted
                ? "bg-red-800/40 text-red-300 hover:bg-red-700/50"
                : "bg-emerald-800/40 text-emerald-300 hover:bg-emerald-700/50"
            }`}
          >
            {isMuted ? (
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  clipRule="evenodd"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="text-center sm:flex-1">
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {timer.status.currentExercise?.name}
          </h1>
          <div className="mt-1 text-xs text-emerald-200/70 sm:text-sm">
            Exercise {timer.status.currentExerciseIndex + 1} of{" "}
            {timer.status.totalExercises}
          </div>
        </div>

        <div className="hidden sm:block sm:flex-1"></div>
      </motion.div>

      {/* Main Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-gradient-to-br ${phaseDisplay.bgColor} mb-6 rounded-2xl border border-white/10 p-4 backdrop-blur-sm sm:mb-8 sm:p-6 lg:p-8`}
      >
        {/* Background animation */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="h-full w-full -skew-x-12 transform animate-pulse bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>

        {/* Phase indicator */}
        <div className="mb-4 text-center sm:mb-6">
          <motion.div
            key={timer.status.phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xl font-bold sm:text-2xl ${phaseDisplay.color} mb-2`}
          >
            {phaseDisplay.label}
          </motion.div>
          <div className="text-sm text-white/80 sm:text-base">
            {timer.status.phase === "work" ? "Keep going!" : "Take a break"}
          </div>
        </div>

        {/* Timer display */}
        <div className="mb-6 text-center sm:mb-8">
          <motion.div
            key={timer.status.timeRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
            className="font-mono text-5xl leading-none font-bold text-white sm:text-7xl md:text-8xl lg:text-9xl"
          >
            {formatTime(timer.status.timeRemaining)}
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-white/20 sm:mb-6 sm:h-3">
          <motion.div
            className={`h-full rounded-full ${
              timer.status.phase === "work"
                ? "bg-gradient-to-r from-red-400 to-red-600"
                : "bg-gradient-to-r from-blue-400 to-blue-600"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Rep and Set counters */}
        <div className="mb-6 flex justify-center space-x-4 sm:mb-8 sm:space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white sm:text-3xl">
              {timer.status.currentRep} / {timer.status.totalReps}
            </div>
          </div>
          <div className="w-px self-stretch bg-white/20" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white sm:text-3xl">
              {timer.status.currentSet}
            </div>
            <div className="text-xs tracking-wide text-white/60 uppercase sm:text-sm">
              Set / {timer.status.totalSets}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          {/* Primary control */}
          {timer.status.state === "running" ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={timer.pause}
              className="flex items-center justify-center rounded-lg bg-yellow-600/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-yellow-500/80 sm:px-8 sm:py-4"
            >
              <svg
                className="mr-2 h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
              Pause
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={timer.start}
              className="flex items-center justify-center rounded-lg bg-emerald-600/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500/80 sm:px-8 sm:py-4"
            >
              <svg
                className="mr-2 h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8"
                />
              </svg>
              {timer.status.state === "paused" ? "Resume" : "Start"}
            </motion.button>
          )}

          {/* Secondary controls */}
          <div className="flex justify-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={timer.skip}
              className="flex items-center justify-center rounded-lg bg-gray-600/80 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-500/80 sm:px-6 sm:py-4 sm:text-base"
            >
              <svg
                className="mr-1 h-4 w-4 sm:mr-2 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="hidden sm:inline">Skip</span>
              <span className="sm:hidden">Skip</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={timer.reset}
              className="flex items-center justify-center rounded-lg bg-red-600/80 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500/80 sm:px-6 sm:py-4 sm:text-base"
            >
              <svg
                className="mr-1 h-4 w-4 sm:mr-2 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">Reset</span>
            </motion.button>

            {/* Exercise Skip Button - only show if multiple exercises */}
            {timer.status.totalExercises > 1 &&
              !timer.status.isLastExercise && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Skip to next exercise by completing current exercise
                    timer.skip();
                  }}
                  className="flex items-center justify-center rounded-lg bg-purple-600/80 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500/80 sm:px-4 sm:py-4 sm:text-base"
                >
                  <svg
                    className="mr-1 h-4 w-4 sm:mr-2 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                  <span className="hidden sm:inline">Next Exercise</span>
                  <span className="sm:hidden">Next</span>
                </motion.button>
              )}
          </div>
        </div>
      </motion.div>

      {/* Completion message */}
      <AnimatePresence>
        {timer.status.state === "complete" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-lg border border-green-600/30 bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-4 text-center sm:p-6"
          >
            <div className="mb-2 text-3xl sm:text-4xl">🎉</div>
            <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
              Workout Complete!
            </h3>
            <p className="mb-4 text-sm text-emerald-200/80 sm:text-base">
              Great job completing your {currentConfig?.workoutName} workout!
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={timer.reset}
                className="rounded-lg bg-emerald-600/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-500/80"
              >
                Go Again
              </button>
              <button
                onClick={handleBackToConfig}
                className="rounded-lg bg-gray-600/80 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-500/80"
              >
                New Workout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
