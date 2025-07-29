import { z } from "zod";

// OpenAI job evaluation response schema
export const jobEvaluationSchema = z.object({
  verdict: z.string(), // "true" or "false"
  reason: z.string(),
  companyName: z.string(),
  rating: z.number().min(1).max(10),
  skills: z.string(),
});

export type JobEvaluation = z.infer<typeof jobEvaluationSchema>;

// Raw job data from Apify LinkedIn scraper
export const rawJobSchema = z.object({
  title: z.string(),
  companyName: z.string(),
  location: z.string(),
  companyWebsite: z.string().optional(),
  applyUrl: z.string().optional(),
  description: z.string().optional(),
  postedDate: z.string().optional(),
});

export type RawJob = z.infer<typeof rawJobSchema>;

// Processed job data for Google Sheets
export const processedJobSchema = z.object({
  status: z.string().default("To Review"),
  role: z.string(),
  company: z.string(),
  location: z.string(),
  rating: z.number(),
  reasonForMatch: z.string(),
  companyWebsite: z.string(),
  jobLink: z.string(),
  skills: z.string(),
  processedAt: z.date().optional(),
});

export type ProcessedJob = z.infer<typeof processedJobSchema>;

// Google Sheets row data (matches n8n workflow columns)
export const sheetRowSchema = z.object({
  Role: z.string(),
  Company: z.string(),
  Location: z.string(),
  Rating: z.string(), // Number as string for sheets
  "Reason for match": z.string(),
  "Company Website": z.string(),
  "Job-Link": z.string(),
  Skills: z.string(),
});

export type SheetRow = z.infer<typeof sheetRowSchema>;

// Job scraping status
export const jobStatusSchema = z.object({
  isRunning: z.boolean(),
  progress: z.number().min(0).max(100),
  stage: z.enum(["scraping", "evaluating", "saving", "completed", "error"]),
  message: z.string(),
  jobsFound: z.number().optional(),
  jobsMatched: z.number().optional(),
  error: z.string().optional(),
});

export type JobStatus = z.infer<typeof jobStatusSchema>;

// Apify request configuration
export const apifyConfigSchema = z.object({
  count: z.number().default(100),
  countryCode: z.number().default(10),
  scrapeCompany: z.boolean().default(true),
  urls: z.array(z.string().url()),
});

export type ApifyConfig = z.infer<typeof apifyConfigSchema>;

// Job processing options
export const jobProcessingOptionsSchema = z.object({
  maxJobs: z.number().default(100),
  skipDuplicates: z.boolean().default(true),
});

export type JobProcessingOptions = {
  maxJobs?: number;
  skipDuplicates?: boolean;
  onProgress?: (status: JobStatus) => void;
};
