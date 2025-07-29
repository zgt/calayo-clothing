"use client";

import { useState } from "react";
import { Play, Settings } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface ScrapeJobsButtonProps {
  disabled?: boolean;
  onJobStarted?: () => void;
}

export default function ScrapeJobsButton({
  disabled,
  onJobStarted,
}: ScrapeJobsButtonProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [maxJobs, setMaxJobs] = useState(100);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const scrapeJobsMutation = api.jobs.scrapeJobs.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      onJobStarted?.();
      setShowSettings(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleStartScraping = async () => {
    try {
      await scrapeJobsMutation.mutateAsync({
        maxJobs,
        skipDuplicates,
      });
    } catch {
      // Error handled by onError callback
    }
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleStartScraping}
          disabled={disabled ?? scrapeJobsMutation.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {scrapeJobsMutation.isPending ? "Starting..." : "Scrape Jobs"}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          disabled={disabled}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-700/20 bg-emerald-900/30 px-3 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-800/40 disabled:opacity-50"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-full left-0 z-10 mt-2 w-80 rounded-lg border border-emerald-700/20 bg-emerald-950/95 p-4 shadow-2xl backdrop-blur-sm">
          <h3 className="mb-3 font-medium text-white">Scraping Settings</h3>

          <div className="space-y-4">
            {/* Max Jobs */}
            <div>
              <label className="mb-1 block text-sm font-medium text-emerald-200">
                Max Jobs to Scrape
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={maxJobs}
                onChange={(e) => setMaxJobs(parseInt(e.target.value) ?? 100)}
                className="w-full rounded-md border border-emerald-700/20 bg-emerald-900/30 px-3 py-2 text-white placeholder-emerald-400/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-emerald-200/60">
                More jobs = longer processing time
              </p>
            </div>

            {/* Skip Duplicates */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded border-emerald-700/20 bg-emerald-900/30 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <span className="text-sm text-emerald-200">
                  Skip duplicate jobs
                </span>
              </label>
              <p className="mt-1 ml-6 text-xs text-emerald-200/60">
                Avoid adding jobs that already exist in the sheet
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-emerald-700/20 pt-2">
              <button
                onClick={handleStartScraping}
                disabled={disabled ?? scrapeJobsMutation.isPending}
                className="flex-1 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {scrapeJobsMutation.isPending
                  ? "Starting..."
                  : "Start Scraping"}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-md border border-emerald-700/20 px-3 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-800/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
