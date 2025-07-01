'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { type TimerConfig, type Exercise } from './useIntervalTimer';

interface TimerConfigProps {
  onStartTimer: (config: TimerConfig) => void;
  initialConfig?: TimerConfig;
}

const DEFAULT_EXERCISE: Exercise = {
  name: 'Isometric Hang',
  sets: 1,
  reps: 6,
  workDuration: 10, // 10 seconds
  restDuration: 20, // 20 seconds
};

const DEFAULT_CONFIG: TimerConfig = {
  workoutName: 'My Workout',
  exercises: [DEFAULT_EXERCISE],
};

const PRESET_WORKOUTS: TimerConfig[] = [
  {
    workoutName: 'Emil\'s Sub-max Daily Fingerbrd',
    exercises: [
      { name: 'Isometric Hang', sets: 1, reps: 6, workDuration: 10, restDuration: 20 },
      { name: 'Isometric Hang: Front 3 Open', sets: 1, reps: 6, workDuration: 10, restDuration: 20 },
      { name: 'Isometric Hang: Front 2 Open', sets: 1, reps: 2, workDuration: 10, restDuration: 20 },
      { name: 'Isometric Hang: Middle 2 Open', sets: 1, reps: 2, workDuration: 10, restDuration: 20 },
      { name: 'Isometric Hang: Front 2 Half Crimp', sets: 1, reps: 2, workDuration: 10, restDuration: 20 },
    ],
  },
  {
    workoutName: 'Tabata Training',
    exercises: [
      { name: 'High Intensity Work', sets: 4, reps: 8, workDuration: 20, restDuration: 10 },
    ],
  },
  {
    workoutName: 'EMOM (Every Minute)',
    exercises: [
      { name: 'Continuous Work', sets: 1, reps: 10, workDuration: 45, restDuration: 15 },
    ],
  },
  {
    workoutName: 'Custom Intervals',
    exercises: [
      { name: 'Mixed Training', sets: 3, reps: 5, workDuration: 30, restDuration: 30 },
    ],
  },
];

export default function TimerConfig({ onStartTimer, initialConfig }: TimerConfigProps) {
  const [config, setConfig] = useState<TimerConfig>(initialConfig ?? DEFAULT_CONFIG);
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
    setConfig(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...DEFAULT_EXERCISE, name: `Exercise ${prev.exercises.length + 1}` }]
    }));
  };

  const removeExercise = (index: number) => {
    if (config.exercises.length > 1) {
      setConfig(prev => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index)
      }));
    }
  };

  const updateExercise = (index: number, exercise: Exercise) => {
    setConfig(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === index ? exercise : ex)
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
      const restTime = exercise.sets * (exercise.reps - 1) * exercise.restDuration;
      const setBreakTime = (exercise.sets - 1) * exercise.restDuration * 2;
      return total + workTime + restTime + setBreakTime;
    }, 0);
  };

  const calculateTotalReps = () => {
    return config.exercises.reduce((total, exercise) => {
      return total + (exercise.sets * exercise.reps);
    }, 0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-900/40 to-emerald-950/60 rounded-lg p-4 sm:p-6 backdrop-blur-sm border border-emerald-700/30"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Interval Timer Setup</h2>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-4 py-2 bg-emerald-700/50 hover:bg-emerald-600/50 text-white rounded-lg transition-colors text-sm self-start sm:self-auto"
          >
            {showPresets ? 'Hide' : 'Show'} Presets
          </button>
        </div>

        {showPresets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <h3 className="text-lg font-semibold text-emerald-200 mb-3">Quick Start Presets</h3>
            <div className="grid grid-cols-1 gap-3">
              {PRESET_WORKOUTS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => loadPreset(preset)}
                  className="p-4 bg-emerald-800/30 hover:bg-emerald-700/40 rounded-lg border border-emerald-600/20 text-left transition-colors"
                >
                  <div className="text-white font-medium mb-2">{preset.workoutName}</div>
                  <div className="text-emerald-200/70 text-sm space-y-1">
                    {preset.exercises.slice(0, 2).map((exercise, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate pr-2">{exercise.name}</span>
                        <span className="flex-shrink-0">{exercise.sets}×{exercise.reps}</span>
                      </div>
                    ))}
                    {preset.exercises.length > 2 && (
                      <div className="text-emerald-300/50 text-xs">+{preset.exercises.length - 2} more exercises</div>
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
            <label className="block text-emerald-200 font-medium mb-2">
              Workout Name
            </label>
            <input
              type="text"
              value={config.workoutName}
              onChange={(e) => setConfig({ ...config, workoutName: e.target.value })}
              className="w-full px-4 py-3 bg-emerald-900/30 border border-emerald-700/30 rounded-lg text-white placeholder-emerald-300/50 focus:outline-none focus:border-emerald-500"
              placeholder="Enter workout name"
            />
          </div>

          {/* Exercises Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <label className="block text-emerald-200 font-medium">
                Exercises
              </label>
              <button
                type="button"
                onClick={addExercise}
                className="px-3 py-2 bg-emerald-700/50 hover:bg-emerald-600/50 text-white rounded text-sm transition-colors self-start sm:self-auto"
              >
                + Add Exercise
              </button>
            </div>
            
            <div className="space-y-4">
              {config.exercises.map((exercise, index) => (
                <div key={index} className="bg-emerald-800/20 rounded-lg p-3 sm:p-4 border border-emerald-600/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-emerald-200 font-medium text-sm sm:text-base">Exercise {index + 1}</h4>
                    {config.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {/* Exercise Name */}
                    <div>
                      <label className="block text-emerald-200/80 text-sm mb-1">
                        Exercise Name
                      </label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(index, { ...exercise, name: e.target.value })}
                        className="w-full px-3 py-2 bg-emerald-900/30 border border-emerald-700/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Exercise name"
                      />
                    </div>
                    
                    {/* Sets and Reps */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-emerald-200/80 text-xs sm:text-sm mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, { ...exercise, sets: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 sm:px-3 py-2 bg-emerald-900/30 border border-emerald-700/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-200/80 text-xs sm:text-sm mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, { ...exercise, reps: parseInt(e.target.value) || 1 })}
                          className="w-full px-2 sm:px-3 py-2 bg-emerald-900/30 border border-emerald-700/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    
                    {/* Work and Rest Duration */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-emerald-200/80 text-xs sm:text-sm mb-1">
                          Work (sec)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={exercise.workDuration}
                          onChange={(e) => updateExercise(index, { ...exercise, workDuration: parseInt(e.target.value) || 10 })}
                          className="w-full px-2 sm:px-3 py-2 bg-emerald-900/30 border border-emerald-700/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-emerald-200/80 text-xs sm:text-sm mb-1">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={exercise.restDuration}
                          onChange={(e) => updateExercise(index, { ...exercise, restDuration: parseInt(e.target.value) || 10 })}
                          className="w-full px-2 sm:px-3 py-2 bg-emerald-900/30 border border-emerald-700/30 rounded text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-emerald-800/20 rounded-lg p-4 border border-emerald-600/20">
            <h3 className="text-emerald-200 font-medium mb-2">Workout Summary</h3>
            <div className="space-y-1 text-sm text-emerald-200/80">
              <div>Total Exercises: {config.exercises.length}</div>
              <div>Total Reps: {calculateTotalReps()}</div>
              <div className="font-medium text-emerald-200 pt-2 border-t border-emerald-600/20">
                Total Duration: ~{formatTime(calculateTotalTime())}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg"
          >
            Start Timer
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}