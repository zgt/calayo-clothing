"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Star,
  MapPin,
  Building,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  AlertCircle,
} from "lucide-react";
import type { ProcessedJob } from "~/lib/job-types";
import StatusSelector from "./StatusSelector";
import { api } from "~/trpc/react";

interface JobsTableProps {
  jobs: ProcessedJob[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onJobUpdate?: (updatedJob: ProcessedJob) => void;
}

type SortField = "role" | "company" | "rating" | "location" | "status";
type SortDirection = "asc" | "desc";

export default function JobsTable({
  jobs,
  isLoading,
  error,
  onRefresh,
  onJobUpdate,
}: JobsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [updatingJobs, setUpdatingJobs] = useState<Set<string>>(new Set());

  // tRPC mutation for updating job status
  const updateJobStatusMutation = api.jobs.updateJobStatus.useMutation({
    onSuccess: () => {
      // Optionally refresh the data or show success message
      onRefresh();
    },
    onError: (error) => {
      console.error("Failed to update job status:", error);
      // Optionally show error message to user
    },
  });

  // Handler for status changes
  const handleStatusChange = async (
    jobIdentifier: { company: string; role: string; jobLink: string },
    newStatus: string,
  ) => {
    const jobKey = `${jobIdentifier.company}-${jobIdentifier.role}-${jobIdentifier.jobLink}`;
    
    // Add to updating set
    setUpdatingJobs((prev) => new Set(prev).add(jobKey));

    try {
      await updateJobStatusMutation.mutateAsync({
        jobIdentifier,
        newStatus,
      });

      // Update local state if callback provided
      if (onJobUpdate) {
        const updatedJob = jobs.find(
          (job) =>
            job.company === jobIdentifier.company &&
            job.role === jobIdentifier.role &&
            job.jobLink === jobIdentifier.jobLink,
        );
        if (updatedJob) {
          onJobUpdate({ ...updatedJob, status: newStatus });
        }
      }
    } finally {
      // Remove from updating set
      setUpdatingJobs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(jobKey);
        return newSet;
      });
    }
  };

  // Filter jobs based on search term and exclude "not relevant" jobs
  const filteredJobs = jobs.filter(
    (job) =>
      // Filter out jobs with "not relevant" status
      job.status?.toLowerCase() !== "not relevant" &&
      // Apply search filter
      (job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.status?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Sort jobs with "to review" priority
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    // First, prioritize "to review" status when sorting by status
    if (sortField === "status") {
      const aIsToReview = a.status?.toLowerCase() === "to review";
      const bIsToReview = b.status?.toLowerCase() === "to review";

      if (aIsToReview && !bIsToReview) return -1;
      if (!aIsToReview && bIsToReview) return 1;
    }

    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case "rating":
        aValue = a.rating;
        bValue = b.rating;
        break;
      case "role":
        aValue = a.role.toLowerCase();
        bValue = b.role.toLowerCase();
        break;
      case "company":
        aValue = a.company.toLowerCase();
        bValue = b.company.toLowerCase();
        break;
      case "location":
        aValue = a.location.toLowerCase();
        bValue = b.location.toLowerCase();
        break;
      case "status":
        aValue = a.status?.toLowerCase() ?? "";
        bValue = b.status?.toLowerCase() ?? "";
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-900/20 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-lg font-medium text-red-300">
          Failed to Load Jobs
        </h3>
        <p className="mb-4 text-red-200/80">
          {error?.message ?? "An error occurred while fetching jobs"}
        </p>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-400/50" />
          <input
            type="text"
            placeholder="Search jobs, companies, skills, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-emerald-700/20 bg-emerald-900/30 py-2 pr-4 pl-10 text-white placeholder-emerald-400/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Results count and refresh */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-emerald-200/70">
            {isLoading
              ? "Loading..."
              : `${sortedJobs.length} of ${jobs.length} jobs${
                  jobs.length - filteredJobs.length > 0
                    ? ` (${jobs.length - filteredJobs.length} filtered out)`
                    : ""
                }`}
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-sm text-emerald-300 hover:text-emerald-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-emerald-700/20 bg-emerald-900/30">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-emerald-200/70">Loading jobs...</p>
          </div>
        ) : sortedJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Building className="mx-auto mb-4 h-12 w-12 text-emerald-400/50" />
            <h3 className="mb-2 text-lg font-medium text-white">
              {searchTerm ? "No matching jobs found" : "No jobs available"}
            </h3>
            <p className="text-emerald-200/70">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start by scraping some jobs to see them here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-emerald-700/20 bg-emerald-900/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-1 font-medium text-emerald-200 hover:text-white"
                    >
                      Status
                      {getSortIcon("status")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center gap-1 font-medium text-emerald-200 hover:text-white"
                    >
                      Role
                      {getSortIcon("role")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("company")}
                      className="flex items-center gap-1 font-medium text-emerald-200 hover:text-white"
                    >
                      Company
                      {getSortIcon("company")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("location")}
                      className="flex items-center gap-1 font-medium text-emerald-200 hover:text-white"
                    >
                      Location
                      {getSortIcon("location")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort("rating")}
                      className="flex items-center gap-1 font-medium text-emerald-200 hover:text-white"
                    >
                      Rating
                      {getSortIcon("rating")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-emerald-200">
                    Skills
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-emerald-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-700/20">
                {sortedJobs.map((job, index) => (
                  <motion.tr
                    key={`${job.jobLink}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-emerald-900/20"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <StatusSelector
                          job={job}
                          onStatusChange={handleStatusChange}
                          isUpdating={updatingJobs.has(
                            `${job.company}-${job.role}-${job.jobLink}`,
                          )}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">{job.role}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-emerald-400/70" />
                        <span className="text-white">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-400/70" />
                        <span className="text-emerald-200">{job.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span className="font-medium text-white">
                          {job.rating}/10
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="max-w-xs truncate text-sm text-emerald-200"
                        title={job.skills}
                      >
                        {job.skills}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={job.jobLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                          aria-disabled={!job.jobLink}
                          tabIndex={!job.jobLink ? -1 : 0}
                          style={
                            !job.jobLink
                              ? { pointerEvents: "none", opacity: 0.5 }
                              : {}
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                          Apply
                        </a>
                        {job.companyWebsite && (
                          <a
                            href={job.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-emerald-700/20 px-3 py-1 text-sm font-medium text-emerald-200 transition-colors hover:bg-emerald-800/40"
                          >
                            <Building className="h-3 w-3" />
                            Site
                          </a>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
