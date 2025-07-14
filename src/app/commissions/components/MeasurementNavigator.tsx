"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp } from "lucide-react";
import { LoadMeasurementsButton } from "./LoadMeasurementsButton";
import { MEASUREMENT_GROUPS, REQUIRED_MEASUREMENTS } from "../constants";
import type { CommissionFormData, MeasurementKey } from "../types";

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};

interface MeasurementNavigatorProps {
  formData: CommissionFormData;
  errors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadMeasurements: () => void;
  isLoadingMeasurements: boolean;
  onMeasurementChange?: (measurement: MeasurementKey | null) => void;
}

export function MeasurementNavigator({
  formData,
  errors,
  onChange,
  onLoadMeasurements,
  isLoadingMeasurements,
  onMeasurementChange,
}: MeasurementNavigatorProps) {
  const [currentMeasurementIndex, setCurrentMeasurementIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isMobile = useIsMobile();

  // Get relevant measurements based on garment type
  const getRelevantMeasurements = () => {
    if (!formData.garmentType) return [];
    
    const allMeasurements = [
      ...MEASUREMENT_GROUPS.upper,
      ...MEASUREMENT_GROUPS.lower,
      ...MEASUREMENT_GROUPS.general,
    ];

    const requiredMeasurements = REQUIRED_MEASUREMENTS[formData.garmentType] ?? [];
    
    // Filter to show required measurements first, then others
    const required = allMeasurements.filter(m => requiredMeasurements.includes(m.id));
    const optional = allMeasurements.filter(m => !requiredMeasurements.includes(m.id));
    
    return [...required, ...optional];
  };

  const relevantMeasurements = getRelevantMeasurements();
  const currentMeasurement = relevantMeasurements[currentMeasurementIndex];

  // Reset to first measurement when garment type changes
  useEffect(() => {
    setCurrentMeasurementIndex(0);
  }, [formData.garmentType]);

  // Notify parent when current measurement changes
  useEffect(() => {
    if (onMeasurementChange && currentMeasurement) {
      onMeasurementChange(currentMeasurement.id as MeasurementKey);
    }
  }, [currentMeasurement, onMeasurementChange]);

  const handlePrevious = () => {
    setCurrentMeasurementIndex(prev => 
      prev > 0 ? prev - 1 : relevantMeasurements.length - 1
    );
  };

  const handleNext = () => {
    setCurrentMeasurementIndex(prev => 
      prev < relevantMeasurements.length - 1 ? prev + 1 : 0
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0]?.clientX ?? 0);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && touchEnd) {
      handleNext();
    } else if (isRightSwipe && touchEnd) {
      handlePrevious();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (!formData.garmentType || !currentMeasurement) {
    return (
      <div className="text-center text-emerald-200/70 py-8">
        <p>Select a garment type to view measurements</p>
      </div>
    );
  }

  const isRequired = REQUIRED_MEASUREMENTS[formData.garmentType]?.includes(currentMeasurement.id);
  const currentValue = formData.measurements[currentMeasurement.id as MeasurementKey];
  const hasError = errors[`measurements.${currentMeasurement.id}`];

  if (isMobile) {
    // Mobile-optimized layout with larger touch targets and swipe support
    return (
      <div className="space-y-6">
        {/* Header with Load Measurements Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-white">Measurements</h3>
          <LoadMeasurementsButton
            onClick={onLoadMeasurements}
            isLoading={isLoadingMeasurements}
          />
        </div>

        {/* Mobile Navigation */}
        <div 
          className="space-y-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe instruction */}
          <div className="text-center">
            <p className="text-emerald-200/70 text-sm mb-2">
              Swipe left/right or use arrows to navigate measurements
            </p>
            <div className="flex items-center justify-center space-x-2 text-emerald-300">
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs">Swipe</span>
              <ArrowUp className="w-4 h-4" />
            </div>
          </div>

          {/* Navigation Buttons - Larger for mobile */}
          <div className="flex items-center justify-between mb-4">
            <motion.button
              type="button"
              onClick={handlePrevious}
              className="flex items-center space-x-2 px-4 py-3 bg-emerald-800/30 hover:bg-emerald-700/40 rounded-xl transition-colors min-w-[100px] justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5 text-emerald-300" />
              <span className="text-emerald-300 text-sm font-medium">Prev</span>
            </motion.button>

            <div className="text-center px-4">
              <span className="text-emerald-200 text-sm">
                {currentMeasurementIndex + 1} of {relevantMeasurements.length}
              </span>
            </div>

            <motion.button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-3 bg-emerald-800/30 hover:bg-emerald-700/40 rounded-xl transition-colors min-w-[100px] justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-emerald-300 text-sm font-medium">Next</span>
              <ChevronRight className="w-5 h-5 text-emerald-300" />
            </motion.button>
          </div>

          {/* Current Measurement Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMeasurementIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
              className="bg-emerald-900/15 rounded-xl p-6 border border-emerald-700/40 backdrop-blur-sm"
            >
              <div className="text-center mb-4">
                <label className="block text-emerald-100 font-semibold text-lg mb-2">
                  {currentMeasurement.label}
                  {isRequired && <span className="text-red-400 ml-1">*</span>}
                </label>
                <p className="text-emerald-200/70 text-sm">
                  {currentMeasurement.id === "posture" ? "Describe your posture" : "Enter measurement in inches"}
                </p>
              </div>
              
              <div className="relative">
                {currentMeasurement.id === "posture" ? (
                  <input
                    type="text"
                    name={`measurements.${currentMeasurement.id}`}
                    value={currentValue as string || ""}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., straight, slightly forward"
                    className={`w-full px-6 py-4 bg-emerald-950/50 border ${
                      hasError ? "border-red-500" : "border-emerald-700/30"
                    } rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-lg`}
                  />
                ) : (
                  <input
                    type="number"
                    name={`measurements.${currentMeasurement.id}`}
                    value={currentValue as number || ""}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder="0.0"
                    step="0.1"
                    min="0"
                    inputMode="decimal"
                    className={`w-full px-6 py-4 bg-emerald-950/50 border ${
                      hasError ? "border-red-500" : "border-emerald-700/30"
                    } rounded-xl text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center text-xl font-semibold`}
                  />
                )}
                
                {hasError && (
                  <p className="mt-2 text-red-400 text-sm text-center">
                    {hasError}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator - Larger for mobile */}
          <div className="flex justify-center space-x-2 mt-6">
            {relevantMeasurements.map((_, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => setCurrentMeasurementIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors touch-target ${
                  index === currentMeasurementIndex 
                    ? "bg-emerald-400" 
                    : "bg-emerald-800/30 hover:bg-emerald-700/40"
                }`}
                style={{ minWidth: '44px', minHeight: '44px' }} // Ensure touch target is at least 44px
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="space-y-4">
      {/* Header with Load Measurements Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Measurements</h3>
        <LoadMeasurementsButton
          onClick={onLoadMeasurements}
          isLoading={isLoadingMeasurements}
        />
      </div>

      {/* Navigation and Input */}
      <div className="flex items-center space-x-4">
        {/* Previous Button */}
        <motion.button
          type="button"
          onClick={handlePrevious}
          className="flex-shrink-0 p-2 bg-emerald-800/30 hover:bg-emerald-700/40 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5 text-emerald-300" />
        </motion.button>

        {/* Current Measurement Input */}
        <div className="flex-1 space-y-2">
          <div className="text-center">
            <label className="block text-emerald-100 font-medium text-sm mb-1">
              {currentMeasurement.label}
              {isRequired && <span className="text-red-400 ml-1">*</span>}
            </label>
            <p className="text-emerald-200/60 text-xs">
              {currentMeasurement.id === "posture" ? "Describe your posture" : "Enter measurement in inches"}
            </p>
          </div>
          
          <div className="relative">
            {currentMeasurement.id === "posture" ? (
              <input
                type="text"
                name={`measurements.${currentMeasurement.id}`}
                value={currentValue as string || ""}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g., straight, slightly forward"
                className={`w-full px-4 py-3 bg-emerald-950/50 border ${
                  hasError ? "border-red-500" : "border-emerald-700/30"
                } rounded-lg text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center`}
              />
            ) : (
              <input
                type="number"
                name={`measurements.${currentMeasurement.id}`}
                value={currentValue as number || ""}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder="0.0"
                step="0.1"
                min="0"
                className={`w-full px-4 py-3 bg-emerald-950/50 border ${
                  hasError ? "border-red-500" : "border-emerald-700/30"
                } rounded-lg text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-center`}
              />
            )}
            
            {hasError && (
              <p className="absolute -bottom-6 left-0 right-0 text-red-400 text-xs text-center">
                {hasError}
              </p>
            )}
          </div>
        </div>

        {/* Next Button */}
        <motion.button
          type="button"
          onClick={handleNext}
          className="flex-shrink-0 p-2 bg-emerald-800/30 hover:bg-emerald-700/40 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-5 h-5 text-emerald-300" />
        </motion.button>
      </div>

      {/* Measurement Progress Indicator */}
      <div className="flex justify-center space-x-1">
        {relevantMeasurements.map((_, index) => (
          <motion.button
            key={index}
            type="button"
            onClick={() => setCurrentMeasurementIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentMeasurementIndex 
                ? "bg-emerald-400" 
                : "bg-emerald-800/30 hover:bg-emerald-700/40"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}