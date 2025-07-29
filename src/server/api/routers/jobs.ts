import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getAdminSession } from "~/lib/admin-utils";
import {
  processJobsPipeline,
  getDefaultLinkedInSearchUrl,
} from "~/lib/job-processor";
import {
  readJobsFromSheet,
  validateSheetsConnection,
  initializeSheetHeaders,
} from "~/lib/google-sheets";
import type { JobStatus } from "~/lib/job-types";

// In-memory storage for job processing status (in production, use Redis or database)
const jobStatusStore = new Map<string, JobStatus>();

export const jobsRouter = createTRPCRouter({
  /**
   * Get all jobs from Google Sheets
   */
  getJobs: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const { isAdmin } = await getAdminSession(ctx.headers);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    try {
      const jobs = await readJobsFromSheet();
      return {
        success: true,
        jobs,
        count: jobs.length,
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch jobs from Google Sheets",
      });
    }
  }),

  /**
   * Start job scraping process
   */
  scrapeJobs: protectedProcedure
    .input(
      z.object({
        maxJobs: z.number().min(1).max(200).default(100),
        skipDuplicates: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      const { session, isAdmin } = await getAdminSession(ctx.headers);
      if (!isAdmin || !session?.user) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const userId = session.user.id;
      const jobId = `job_${userId}_${Date.now()}`;

      // Check if there's already a job running for this user
      const existingJob = Array.from(jobStatusStore.values()).find(
        (status) => status.isRunning,
      );

      if (existingJob) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Job scraping is already in progress",
        });
      }

      // Initialize job status
      const initialStatus: JobStatus = {
        isRunning: true,
        progress: 0,
        stage: "scraping",
        message: "Initializing job scraping...",
        jobsFound: 0,
        jobsMatched: 0,
      };

      jobStatusStore.set(jobId, initialStatus);

      // Start the job processing in the background
      processJobsPipeline({
        maxJobs: input.maxJobs,
        skipDuplicates: input.skipDuplicates,
        onProgress: (status: JobStatus) => {
          jobStatusStore.set(jobId, status);
        },
      })
        .then((matchingJobs) => {
          // Job completed successfully
          const finalStatus: JobStatus = {
            isRunning: false,
            progress: 100,
            stage: "completed",
            message: `Successfully found ${matchingJobs.length} matching jobs!`,
            jobsFound: matchingJobs.length,
            jobsMatched: matchingJobs.length,
          };
          jobStatusStore.set(jobId, finalStatus);

          // Clean up status after 1 hour
          setTimeout(
            () => {
              jobStatusStore.delete(jobId);
            },
            60 * 60 * 1000,
          );
        })
        .catch((error) => {
          // Job failed
          const errorStatus: JobStatus = {
            isRunning: false,
            progress: 0,
            stage: "error",
            message: "Job processing failed",
            error: error instanceof Error ? error.message : "Unknown error",
          };
          jobStatusStore.set(jobId, errorStatus);

          // Clean up status after 1 hour
          setTimeout(
            () => {
              jobStatusStore.delete(jobId);
            },
            60 * 60 * 1000,
          );
        });

      return {
        success: true,
        jobId,
        message: "Job scraping started successfully",
      };
    }),

  /**
   * Get job processing status
   */
  getJobStatus: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const { isAdmin } = await getAdminSession(ctx.headers);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    // Find the most recent job status
    const statuses = Array.from(jobStatusStore.values());
    const latestStatus =
      statuses.length > 0 ? statuses[statuses.length - 1] : null;

    return {
      success: true,
      status: latestStatus ?? {
        isRunning: false,
        progress: 0,
        stage: "completed" as const,
        message: "No jobs running",
      },
    };
  }),

  /**
   * Validate connection to external services
   */
  validateConnections: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const { isAdmin } = await getAdminSession(ctx.headers);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    const validationResults = {
      googleSheets: false,
      sheetsInitialized: false,
      errors: [] as string[],
    };

    try {
      // Test Google Sheets connection
      await validateSheetsConnection();
      validationResults.googleSheets = true;

      // Initialize sheet headers if needed
      await initializeSheetHeaders();
      validationResults.sheetsInitialized = true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      validationResults.errors.push(`Google Sheets: ${errorMessage}`);
    }

    return {
      success: validationResults.errors.length === 0,
      validationResults,
    };
  }),

  /**
   * Get configuration information
   */
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const { isAdmin } = await getAdminSession(ctx.headers);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    return {
      success: true,
      config: {
        defaultSearchUrl: getDefaultLinkedInSearchUrl(),
        maxJobsPerRun: 200,
        supportedSources: ["LinkedIn"],
      },
    };
  }),

  /**
   * Clear job processing status (for testing/debugging)
   */
  clearJobStatus: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user is admin
    const { isAdmin } = await getAdminSession(ctx.headers);
    if (!isAdmin) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }

    jobStatusStore.clear();

    return {
      success: true,
      message: "Job status cleared",
    };
  }),
});
