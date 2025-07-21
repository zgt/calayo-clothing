import { useState, useEffect, useCallback, useRef } from "react";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  workDuration: number; // seconds
  restDuration: number; // seconds
}

export interface TimerConfig {
  workoutName: string;
  exercises: Exercise[];
}

export type TimerState = "idle" | "running" | "paused" | "complete";
export type TimerPhase = "work" | "rest" | "setBreak";

export interface TimerStatus {
  state: TimerState;
  phase: TimerPhase;
  currentExerciseIndex: number;
  currentSet: number;
  currentRep: number;
  timeRemaining: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  isLastRep: boolean;
  isLastSet: boolean;
  isLastExercise: boolean;
  currentExercise: Exercise;
}

export function useIntervalTimer(config: TimerConfig) {
  const [state, setState] = useState<TimerState>("idle");
  const [phase, setPhase] = useState<TimerPhase>("work");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(
    config.exercises.length > 0
      ? (config.exercises[0]?.workDuration ?? 10)
      : 10,
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onPhaseChangeRef = useRef<((phase: TimerPhase) => void) | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const currentExercise = config.exercises[currentExerciseIndex];
  const isLastRep = currentRep === currentExercise?.reps;
  const isLastSet = currentSet === currentExercise?.sets;
  const isLastExercise = currentExerciseIndex === config.exercises.length - 1;

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState("idle");
    setPhase("work");
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCurrentRep(1);
    setTimeRemaining(
      config.exercises.length > 0
        ? (config.exercises[0]?.workDuration ?? 10)
        : 10,
    );
  }, [config.exercises]);

  const start = useCallback(() => {
    if (state === "complete") {
      resetTimer();
      return;
    }
    setState("running");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [state, resetTimer]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState("paused");
  }, []);

  const skip = useCallback(() => {
    setTimeRemaining(0);
  }, []);

  // Reset timer when config changes (but only if we're not currently running)
  useEffect(() => {
    if (state === "idle") {
      resetTimer();
    }
  }, [config, state, resetTimer]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle phase transitions
  useEffect(() => {
    if (state === "running" && timeRemaining === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (phase === "work") {
        // Work phase complete
        if (isLastRep && isLastSet && isLastExercise) {
          // Entire workout complete
          setState("complete");
          onCompleteRef.current?.();
        } else if (isLastRep && isLastSet) {
          // Exercise complete, move to next exercise
          setCurrentExerciseIndex((prev) => prev + 1);
          setCurrentSet(1);
          setCurrentRep(1);
          setPhase("setBreak");
          setTimeRemaining((currentExercise?.restDuration ?? 20) * 2);
          onPhaseChangeRef.current?.("setBreak");
        } else if (isLastRep) {
          // Set complete, move to next set
          setPhase("setBreak");
          setTimeRemaining((currentExercise?.restDuration ?? 20) * 2);
          setCurrentSet((prev) => prev + 1);
          setCurrentRep(1);
          onPhaseChangeRef.current?.("setBreak");
        } else {
          // Rep complete, move to rest
          setPhase("rest");
          setTimeRemaining(currentExercise?.restDuration ?? 20);
          setCurrentRep((prev) => prev + 1);
          onPhaseChangeRef.current?.("rest");
        }
      } else {
        // Rest phase complete, back to work
        setPhase("work");
        setTimeRemaining(currentExercise?.workDuration ?? 10);
        onPhaseChangeRef.current?.("work");
      }

      if (state === "running") {
        // Continue automatically
        intervalRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [
    state,
    timeRemaining,
    phase,
    isLastRep,
    isLastSet,
    isLastExercise,
    currentExercise,
  ]);

  const setOnPhaseChange = useCallback(
    (callback: (phase: TimerPhase) => void) => {
      onPhaseChangeRef.current = callback;
    },
    [],
  );

  const setOnComplete = useCallback((callback: () => void) => {
    onCompleteRef.current = callback;
  }, []);

  const status: TimerStatus = {
    state,
    phase,
    currentExerciseIndex,
    currentSet,
    currentRep,
    timeRemaining,
    totalExercises: config.exercises.length,
    totalSets: currentExercise?.sets ?? 0,
    totalReps: currentExercise?.reps ?? 0,
    isLastRep,
    isLastSet,
    isLastExercise,
    currentExercise: currentExercise ?? {
      name: "Default",
      sets: 1,
      reps: 1,
      workDuration: 10,
      restDuration: 10,
    },
  };

  return {
    status,
    start,
    pause,
    reset: resetTimer,
    skip,
    setOnPhaseChange,
    setOnComplete,
  };
}
