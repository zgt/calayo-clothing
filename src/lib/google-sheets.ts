import { google } from "googleapis";
import { env } from "~/env.js";
import type { ProcessedJob } from "./job-types";

// Initialize Google Sheets client
function initializeSheets() {
  // Parse the service account credentials from environment variable
  let credentials: Record<string, unknown>;
  try {
    credentials = JSON.parse(env.GOOGLE_SHEETS_SERVICE_ACCOUNT) as Record<
      string,
      unknown
    >;
  } catch {
    throw new Error("Invalid GOOGLE_SHEETS_SERVICE_ACCOUNT JSON");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: credentials as { client_email: string; private_key: string },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Read existing jobs from Google Sheets
 * @returns Array of processed jobs from the sheet
 */
export async function readJobsFromSheet(): Promise<ProcessedJob[]> {
  try {
    const sheets = initializeSheets();
    const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Read all data from the sheet starting from row 2 (skip header)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Job boards!A2:L", // Columns A-I, starting from row 2
    });

    const rows = response.data.values ?? [];

    // Filter out rows that match the specific pattern ['', '6', '0']
    const filteredRows = rows.filter((row) => {
      // Check if the row matches the exact pattern to exclude
      const isExcludedPattern = 
        row.length >= 3 &&
        row[0] === '' &&
        row[1] === '6' &&
        row[2] === '0' &&
        // Ensure the rest of the row is empty or undefined
        row.slice(3).every((cell) => 
          cell === undefined || cell === null || String(cell).trim() === ""
        );
      
      return !isExcludedPattern;
    });

    // Convert sheet rows to ProcessedJob objects
    const jobs: ProcessedJob[] = filteredRows.map((row) => ({
      status: (row[0] as string) ?? "",
      role: (row[3] as string) ?? "",
      company: (row[4] as string) ?? "",
      location: (row[5] as string) ?? "",
      rating: parseFloat((row[11] as string) ?? "0") || 0,
      reasonForMatch: (row[10] as string) ?? "",
      companyWebsite: (row[7] as string) ?? "",
      jobLink: (row[8] as string) ?? "",
      skills: (row[9] as string) ?? "",
    }));

    return jobs;
  } catch (error) {
    console.error("Error reading jobs from Google Sheets:", error);
    throw new Error("Failed to read jobs from Google Sheets");
  }
}

/**
 * Check if a job already exists in the sheet (by company name, role title, and job URL)
 * @param existingJobs - Array of existing jobs
 * @param newJob - New job to check for duplicates
 * @returns true if job already exists
 */
export function isDuplicateJob(
  existingJobs: ProcessedJob[],
  newJob: { company: string; role: string; jobLink: string },
): boolean {
  return existingJobs.some(
    (job) =>
      job.company === newJob.company &&
      job.role === newJob.role &&
      job.jobLink === newJob.jobLink,
  );
}

/**
 * Append new jobs to Google Sheets
 * @param jobs - Array of processed jobs to add
 * @returns Promise that resolves when jobs are added
 */
export async function appendJobsToSheet(jobs: ProcessedJob[]): Promise<void> {
  if (jobs.length === 0) return;

  try {
    const sheets = initializeSheets();
    const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Convert ProcessedJob objects to sheet row format
    const rows: string[][] = jobs.map((job) => [
      "To Review",
      "1",
      "1",
      job.role,
      job.company,
      job.location,
      "",
      job.companyWebsite,
      job.jobLink,
      job.skills,
      job.reasonForMatch,
      job.rating.toString(),
    ]);

    // Append the rows to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Job boards!A:L",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });

    console.log(`Successfully added ${jobs.length} jobs to Google Sheets`);
  } catch (error) {
    console.error("Error appending jobs to Google Sheets:", error);
    throw new Error("Failed to append jobs to Google Sheets");
  }
}

/**
 * Get the header row from the sheet to verify column structure
 * @returns Array of header column names
 */
export async function getSheetHeaders(): Promise<string[]> {
  try {
    const sheets = initializeSheets();
    const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Job boards!A1:L1", // First row only
    });

    return (response.data.values?.[0] as string[]) ?? [];
  } catch (error) {
    console.error("Error reading sheet headers:", error);
    throw new Error("Failed to read sheet headers");
  }
}

/**
 * Initialize the sheet with proper headers if it's empty
 * @returns Promise that resolves when headers are set
 */
export async function initializeSheetHeaders(): Promise<void> {
  try {
    const headers = await getSheetHeaders();

    // If sheet is empty or doesn't have the expected headers, initialize it
    if (headers.length === 0) {
      const sheets = initializeSheets();
      const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

      const headerRow = [
        "Status",
        "Role",
        "Company",
        "Location",
        "Compensation",
        "Rating",
        "Reason for match",
        "Company Website",
        "Job-Link",
        "Skills",
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: "Job boards!A1:L1",
        valueInputOption: "RAW",
        requestBody: {
          values: [headerRow],
        },
      });

      console.log("Initialized Google Sheets headers");
    }
  } catch (error) {
    console.error("Error initializing sheet headers:", error);
    throw new Error("Failed to initialize sheet headers");
  }
}

/**
 * Update a specific job's status in Google Sheets
 * @param jobIdentifier - Object containing company, role, and jobLink to identify the row
 * @param newStatus - New status value to set
 * @returns Promise that resolves when the status is updated
 */
export async function updateJobStatus(
  jobIdentifier: { company: string; role: string; jobLink: string },
  newStatus: string,
): Promise<void> {
  try {
    const sheets = initializeSheets();
    const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // First, read all data to find the correct row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Job boards!A2:L", // Same range as readJobsFromSheet
    });

    const rows = response.data.values ?? [];

    // Find the row that matches the job identifier
    let targetRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const rowCompany = (row[4] as string) ?? ""; // Column E (index 4)
      const rowRole = (row[3] as string) ?? ""; // Column D (index 3)
      const rowJobLink = (row[8] as string) ?? ""; // Column I (index 8)

      if (
        rowCompany === jobIdentifier.company &&
        rowRole === jobIdentifier.role &&
        rowJobLink === jobIdentifier.jobLink
      ) {
        targetRowIndex = i + 2; // +2 because sheet is 1-indexed and we start from row 2
        break;
      }
    }

    if (targetRowIndex === -1) {
      throw new Error("Job not found in Google Sheets");
    }

    // Update the status in column A of the found row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Job boards!A${targetRowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[newStatus]],
      },
    });

    console.log(
      `Successfully updated job status to "${newStatus}" for ${jobIdentifier.role} at ${jobIdentifier.company}`,
    );
  } catch (error) {
    console.error("Error updating job status in Google Sheets:", error);
    throw new Error("Failed to update job status in Google Sheets");
  }
}

/**
 * Validate Google Sheets connection and permissions
 * @returns Promise that resolves if connection is successful
 */
export async function validateSheetsConnection(): Promise<void> {
  try {
    const sheets = initializeSheets();
    const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;

    // Try to read the spreadsheet metadata
    await sheets.spreadsheets.get({
      spreadsheetId,
    });

    console.log("Google Sheets connection validated successfully");
  } catch (error) {
    console.error("Google Sheets connection validation failed:", error);
    throw new Error(
      "Failed to connect to Google Sheets. Check credentials and spreadsheet ID.",
    );
  }
}
