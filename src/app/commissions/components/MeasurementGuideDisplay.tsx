"use client";

import { motion } from "framer-motion";
import { MEASUREMENT_GUIDE_ITEMS, MEASUREMENT_TIPS } from "../measurementGuideData";
import type { MeasurementKey } from "../types";

interface MeasurementGuideDisplayProps {
  currentMeasurement: MeasurementKey | null;
  className?: string;
}

export function MeasurementGuideDisplay({ 
  currentMeasurement, 
  className = "" 
}: MeasurementGuideDisplayProps) {
  if (!currentMeasurement) {
    return (
      <div className={`bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-6 border border-emerald-700/10 ${className}`}>
        <div className="text-center text-emerald-200/70 py-8">
          <p>Select a measurement to view guidance</p>
        </div>
      </div>
    );
  }

  const guideItem = MEASUREMENT_GUIDE_ITEMS[currentMeasurement];
  
  if (!guideItem) {
    return (
      <div className={`bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-6 border border-emerald-700/10 ${className}`}>
        <div className="text-center text-emerald-200/70 py-8">
          <p>No guidance available for this measurement</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={currentMeasurement}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-xs rounded-2xl shadow-2xl p-6 border border-emerald-700/10 ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b border-emerald-700/30 pb-3">
          <h3 className="text-lg font-semibold text-emerald-200">{guideItem.title}</h3>
          <p className="mt-2 text-sm text-emerald-200/80">{guideItem.description}</p>
        </div>

        {/* Measurement Tips */}
        <div className="rounded-md bg-emerald-900/50 p-4 border border-emerald-700/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg 
                className="h-5 w-5 text-emerald-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-emerald-200">Measurement Tips:</h4>
              <div className="mt-2 text-sm text-emerald-200/70">
                <ul className="list-disc space-y-1 pl-5">
                  {MEASUREMENT_TIPS.slice(0, 4).map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Visual indicator for current measurement */}
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-800/30 text-emerald-200 border border-emerald-700/30">
            Current: {guideItem.title}
          </div>
        </div>
      </div>
    </motion.div>
  );
}