"use client";

import { useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import type { ProcessedJob } from "~/lib/job-types";

interface StatusSelectorProps {
  job: ProcessedJob;
  onStatusChange: (
    jobIdentifier: { company: string; role: string; jobLink: string },
    newStatus: string,
  ) => Promise<void>;
  isUpdating?: boolean;
}

const STATUS_OPTIONS = [
  { value: "To Review", label: "To Review", color: "amber" },
  { value: "Applied", label: "Applied", color: "emerald" },
  { value: "Interview", label: "Interview", color: "blue" },
  { value: "Rejected", label: "Rejected", color: "red" },
  { value: "Not Relevant", label: "Not Relevant", color: "slate" },
] as const;

const getStatusColors = (status: string) => {
  const option = STATUS_OPTIONS.find(
    (opt) => opt.value.toLowerCase() === status.toLowerCase(),
  );
  const color = option?.color ?? "slate";

  const colorMap = {
    amber: "border-amber-800/20 bg-amber-900/50 text-amber-200",
    emerald: "border-emerald-800/20 bg-emerald-900/50 text-emerald-200",
    blue: "border-blue-800/20 bg-blue-900/50 text-blue-200",
    red: "border-red-800/20 bg-red-900/50 text-red-200",
    slate: "border-slate-800/20 bg-slate-900/50 text-slate-200",
  };

  return colorMap[color];
};

export default function StatusSelector({
  job,
  onStatusChange,
  isUpdating = false,
}: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(job.status || "To Review");

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    setCurrentStatus(newStatus);
    setIsOpen(false);

    const jobIdentifier = {
      company: job.company,
      role: job.role,
      jobLink: job.jobLink,
    };

    try {
      await onStatusChange(jobIdentifier, newStatus);
    } catch (error) {
      // Revert the status on error
      setCurrentStatus(job.status || "To Review");
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 ${getStatusColors(
          currentStatus,
        )} ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        <span>{currentStatus}</span>
      </button>

      {isOpen && !isUpdating && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 z-20 mt-1 min-w-[140px] rounded-lg border border-emerald-700/20 bg-emerald-900/95 py-1 shadow-lg backdrop-blur-sm">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-emerald-800/40 ${
                  currentStatus.toLowerCase() === option.value.toLowerCase()
                    ? "bg-emerald-800/20"
                    : ""
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full border ${getStatusColors(
                    option.value,
                  )}`}
                />
                <span className="text-white">{option.label}</span>
                {currentStatus.toLowerCase() === option.value.toLowerCase() && (
                  <Check className="ml-auto h-3 w-3 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}