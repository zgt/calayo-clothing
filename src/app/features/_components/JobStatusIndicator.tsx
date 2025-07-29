"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2, Search, Brain, Save } from "lucide-react";
import type { JobStatus } from "~/lib/job-types";

interface JobStatusIndicatorProps {
  status: JobStatus;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export default function JobStatusIndicator({ 
  status, 
  onComplete, 
  onError 
}: JobStatusIndicatorProps) {
  const prevStatusRef = useRef<JobStatus | null>(null);

  // Handle status changes
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    
    if (prevStatus?.isRunning && !status.isRunning) {
      if (status.stage === "completed") {
        onComplete?.();
      } else if (status.stage === "error" && status.error) {
        onError?.(status.error);
      }
    }
    
    prevStatusRef.current = status;
  }, [status, onComplete, onError]);

  if (!status.isRunning && status.stage === "completed" && status.progress === 0) {
    return null; // Don't show indicator when there's no job running or completed
  }

  const getStageIcon = () => {
    switch (status.stage) {
      case "scraping":
        return <Search className="h-5 w-5" />;
      case "evaluating":
        return <Brain className="h-5 w-5" />;
      case "saving":
        return <Save className="h-5 w-5" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  const getStageColor = () => {
    switch (status.stage) {
      case "completed":
        return "border-emerald-500/20 bg-emerald-900/30";
      case "error":
        return "border-red-500/20 bg-red-900/30";
      default:
        return "border-blue-500/20 bg-blue-900/30";
    }
  };

  const getProgressColor = () => {
    switch (status.stage) {
      case "completed":
        return "bg-emerald-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg border p-4 ${getStageColor()}`}
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {status.isRunning ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          ) : (
            getStageIcon()
          )}
        </div>

        {/* Status Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">
              {status.message}
            </p>
            <span className="text-sm text-white/70">
              {status.progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getProgressColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${status.progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Job Counts */}
          {(status.jobsFound !== undefined || status.jobsMatched !== undefined) && (
            <div className="flex items-center gap-4 mt-2 text-xs text-white/70">
              {status.jobsFound !== undefined && (
                <span>Found: {status.jobsFound}</span>
              )}
              {status.jobsMatched !== undefined && (
                <span>Matched: {status.jobsMatched}</span>
              )}
            </div>
          )}

          {/* Error Details */}
          {status.error && (
            <div className="mt-2 text-sm text-red-300">
              <strong>Error:</strong> {status.error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}