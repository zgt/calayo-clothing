"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type TimerConfig, type Exercise } from "./useIntervalTimer";

interface TimerConfigProps {
  onStartTimer: (config: TimerConfig) => void;
  initialConfig?: TimerConfig;
}

const DEFAULT_EXERCISE: Exercise = {
  name: "Isometric Hang",
  sets: 1,
  reps: 6,
  workDuration: 10, // 10 seconds
  restDuration: 20, // 20 seconds
};

const DEFAULT_CONFIG: TimerConfig = {
  workoutName: "Daily Fingerboard",
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

const PRESET_WORKOUTS: TimerConfig[] = [
  {
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
  },
  {
    workoutName: "Tabata Training",
    exercises: [
      {
        name: "High Intensity Work",
        sets: 4,
        reps: 8,
        workDuration: 20,
        restDuration: 10,
      },
    ],
  },
  {
    workoutName: "EMOM (Every Minute)",
    exercises: [
      {
        name: "Continuous Work",
        sets: 1,
        reps: 10,
        workDuration: 45,
        restDuration: 15,
      },
    ],
  },
  {
    workoutName: "Custom Intervals",
    exercises: [
      {
        name: "Mixed Training",
        sets: 3,
        reps: 5,
        workDuration: 30,
        restDuration: 30,
      },
    ],
  },
];

export default function TimerConfig({
  onStartTimer,
  initialConfig,
}: TimerConfigProps) {
  const [config, setConfig] = useState<TimerConfig>(
    initialConfig ?? DEFAULT_CONFIG,
  );
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTimer(config);
  };

  const loadPreset = (preset: TimerConfig) => {
    setConfig(preset);
    setShowPresets(false);
  };

  const addExercise = () => {
    setConfig((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { ...DEFAULT_EXERCISE, name: `Exercise ${prev.exercises.length + 1}` },
      ],
    }));
  };

  const removeExercise = (index: number) => {
    if (config.exercises.length > 1) {
      setConfig((prev) => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index),
      }));
    }
  };

  const updateExercise = (index: number, exercise: Exercise) => {
    setConfig((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => (i === index ? exercise : ex)),
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const calculateTotalTime = () => {
    return config.exercises.reduce((total, exercise) => {
      const workTime = exercise.sets * exercise.reps * exercise.workDuration;
      const restTime =
        exercise.sets * (exercise.reps - 1) * exercise.restDuration;
      const setBreakTime = (exercise.sets - 1) * exercise.restDuration * 2;
      return total + workTime + restTime + setBreakTime;
    }, 0);
  };

  const calculateTotalReps = () => {
    return config.exercises.reduce((total, exercise) => {
      return total + exercise.sets * exercise.reps;
    }, 0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-emerald-700/30 bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 p-4 backdrop-blur-sm sm:p-6"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Interval Timer Setup
          </h2>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="self-start rounded-lg bg-emerald-700/50 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-600/50 sm:self-auto"
          >
            {showPresets ? "Hide" : "Show"} Presets
          </button>
        </div>

        {showPresets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6"
          >
            <h3 className="mb-3 text-lg font-semibold text-emerald-200">
              Quick Start Presets
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_WORKOUTS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(preset)}
                  className="rounded-lg border border-emerald-600/20 bg-emerald-800/30 p-4 text-left transition-colors hover:bg-emerald-700/40"
                >
                  <div className="mb-2 font-medium text-white">
                    {preset.workoutName}
                  </div>
                  <div className="space-y-1 text-sm text-emerald-200/70">
                    {preset.exercises.slice(0, 2).map((exercise, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate pr-2">{exercise.name}</span>
                        <span className="flex-shrink-0">
                          {exercise.sets}×{exercise.reps}
                        </span>
                      </div>
                    ))}
                    {preset.exercises.length > 2 && (
                      <div className="text-xs text-emerald-300/50">
                        +{preset.exercises.length - 2} more exercises
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Name */}
          <div>
            <label className="mb-2 block font-medium text-emerald-200">
              Workout Name
            </label>
            <input
              type="text"
              value={config.workoutName}
              onChange={(e) =>
                setConfig({ ...config, workoutName: e.target.value })
              }
              className="w-full rounded-lg border border-emerald-700/30 bg-emerald-900/30 px-4 py-3 text-white placeholder-emerald-300/50 focus:border-emerald-500 focus:outline-none"
              placeholder="Enter workout name"
            />
          </div>

          {/* Exercises Section */}
          <div>
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <label className="block font-medium text-emerald-200">
                Exercises
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="self-start rounded bg-emerald-700/50 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-600/50 sm:self-auto"
              >
                + Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {config.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-emerald-600/20 bg-emerald-800/20 p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-emerald-200 sm:text-base">
                      Exercise {index + 1}
                    </h4>
                    {config.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="px-2 py-1 text-sm text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Exercise Name */}
                    <div>
                      <label className="mb-1 block text-sm text-emerald-200/80">
                        Exercise Name
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) =>
                          updateExercise(index, {
                            ...exercise,
                            name: e.target.value,
                          })
                        }
                        className="w-full rounded border border-emerald-700/30 bg-emerald-900/30 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="Exercise name"
                      />
                    </div>

                    {/* Sets and Reps */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-emerald-200/80 sm:text-sm">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(index, {
                              ...exercise,
                              sets: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded border border-emerald-700/30 bg-emerald-900/30 px-2 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none sm:px-3"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-emerald-200/80 sm:text-sm">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(index, {
                              ...exercise,
                              reps: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded border border-emerald-700/30 bg-emerald-900/30 px-2 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none sm:px-3"
                        />
                      </div>
                    </div>

                    {/* Work and Rest Duration */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="mb-1 block text-xs text-emerald-200/80 sm:text-sm">
                          Work (sec)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={exercise.workDuration}
                          onChange={(e) =>
                            updateExercise(index, {
                              ...exercise,
                              workDuration: parseInt(e.target.value) || 10,
                            })
                          }
                          className="w-full rounded border border-emerald-700/30 bg-emerald-900/30 px-2 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none sm:px-3"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-emerald-200/80 sm:text-sm">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={exercise.restDuration}
                          onChange={(e) =>
                            updateExercise(index, {
                              ...exercise,
                              restDuration: parseInt(e.target.value) || 10,
                            })
                          }
                          className="w-full rounded border border-emerald-700/30 bg-emerald-900/30 px-2 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none sm:px-3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-emerald-600/20 bg-emerald-800/20 p-4">
            <h3 className="mb-2 font-medium text-emerald-200">
              Workout Summary
            </h3>
            <div className="space-y-1 text-sm text-emerald-200/80">
              <div>Total Exercises: {config.exercises.length}</div>
              <div>Total Reps: {calculateTotalReps()}</div>
              <div className="border-t border-emerald-600/20 pt-2 font-medium text-emerald-200">
                Total Duration: ~{formatTime(calculateTotalTime())}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-500 hover:to-emerald-600"
          >
            Start Timer
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
