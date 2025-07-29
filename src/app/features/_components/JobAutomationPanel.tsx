"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import type { ProcessedJob } from "~/lib/job-types";
import JobsTable from "./JobsTable";
import ScrapeJobsButton from "./ScrapeJobsButton";
import JobStatusIndicator from "./JobStatusIndicator";

export default function JobAutomationPanel() {
  const [isTableView, setIsTableView] = useState(true);

  // Get jobs data
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = api.jobs.getJobs.useQuery();

  // Get job status
  const { data: statusData, refetch: refetchStatus } =
    api.jobs.getJobStatus.useQuery(undefined, {
      refetchInterval: (query) => {
        // Poll every 2 seconds if job is running, otherwise don't poll
        return query?.state?.data?.success &&
          query?.state?.data?.status?.isRunning
          ? 2000
          : false;
      },
    });

  // Validate connections
  const {
    data: validationData,
    isLoading: validationLoading,
    refetch: validateConnections,
  } = api.jobs.validateConnections.useQuery();

  const jobs = jobsData?.jobs ?? [];
  const jobStatus = statusData?.status;
  const isJobRunning = jobStatus?.isRunning ?? false;

  const handleJobComplete = () => {
    // Refetch jobs when scraping completes
    void refetchJobs();
    void refetchStatus();
    toast.success("Job scraping completed!");
  };

  const handleJobError = (error: string) => {
    toast.error(`Job scraping failed: ${error}`);
    void refetchStatus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Job Automation</h2>
          <p className="text-emerald-200/70">
            Automated LinkedIn job scraping with AI-powered filtering
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {validationLoading ? (
            <div className="flex items-center gap-2 text-amber-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking connections...</span>
            </div>
          ) : validationData?.success ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Connection issues</span>
            </div>
          )}

          <button
            onClick={() => validateConnections()}
            disabled={validationLoading}
            className="text-xs text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Job Status Indicator */}
      {jobStatus && (
        <JobStatusIndicator
          status={jobStatus}
          onComplete={handleJobComplete}
          onError={handleJobError}
        />
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Scrape Jobs Button */}
        <ScrapeJobsButton
          disabled={isJobRunning}
          onJobStarted={() => refetchStatus()}
        />

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-emerald-200/70">View:</span>
          <div className="inline-flex rounded-md border border-emerald-700/20 bg-emerald-900/30 p-1">
            <button
              onClick={() => setIsTableView(true)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                isTableView
                  ? "bg-emerald-700 text-white"
                  : "text-emerald-200 hover:bg-emerald-800/40"
              }`}
            >
              <Database className="mr-1.5 inline h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setIsTableView(false)}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                !isTableView
                  ? "bg-emerald-700 text-white"
                  : "text-emerald-200 hover:bg-emerald-800/40"
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Connection Errors */}
      {validationData && !validationData.success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-500/20 bg-red-900/20 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
            <div>
              <h3 className="font-medium text-red-300">Connection Issues</h3>
              <ul className="mt-1 space-y-1 text-sm text-red-200/80">
                {validationData.validationResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isTableView ? (
          <JobsTable
            jobs={jobs}
            isLoading={jobsLoading}
            error={jobsError ? new Error(jobsError.message) : null}
            onRefresh={refetchJobs}
          />
        ) : (
          <JobStats jobs={jobs} isLoading={jobsLoading} />
        )}
      </motion.div>
    </div>
  );
}

// Job statistics component
function JobStats({
  jobs,
  isLoading,
}: {
  jobs: ProcessedJob[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-6"
          >
            <div className="animate-pulse">
              <div className="mb-2 h-8 w-16 rounded bg-emerald-900/50"></div>
              <div className="h-4 w-24 rounded bg-emerald-900/50"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out "not relevant" jobs for statistics
  const relevantJobs = jobs.filter(
    (job) => job.status?.toLowerCase() !== "not relevant",
  );

  const totalJobs = relevantJobs.length;
  const avgRating =
    relevantJobs.length > 0
      ? (
          relevantJobs.reduce((sum, job) => sum + job.rating, 0) /
          relevantJobs.length
        ).toFixed(1)
      : "0";
  const topCompanies = relevantJobs.reduce(
    (acc, job) => {
      acc[job.company] = (acc[job.company] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const mostActiveCompany =
    Object.entries(topCompanies).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    "None";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-6">
        <div className="text-3xl font-bold text-emerald-400">{totalJobs}</div>
        <div className="text-emerald-200/70">Total Matching Jobs</div>
      </div>

      <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-6">
        <div className="text-3xl font-bold text-emerald-400">{avgRating}</div>
        <div className="text-emerald-200/70">Average Match Rating</div>
      </div>

      <div className="rounded-lg border border-emerald-700/20 bg-emerald-900/30 p-6">
        <div className="truncate text-lg font-bold text-emerald-400">
          {mostActiveCompany}
        </div>
        <div className="text-emerald-200/70">Most Active Company</div>
      </div>
    </div>
  );
}
