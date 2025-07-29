import { ApifyClient } from "apify-client";
import OpenAI from "openai";
import { env } from "~/env.js";
import type { 
  RawJob, 
  JobEvaluation, 
  ProcessedJob, 
  ApifyConfig, 
  JobProcessingOptions,
  JobStatus 
} from "./job-types";
import { 
  readJobsFromSheet, 
  appendJobsToSheet, 
  isDuplicateJob,
  initializeSheetHeaders 
} from "./google-sheets";
import { jobEvaluationSchema, rawJobSchema } from "./job-types";

// Initialize API clients
const apifyClient = new ApifyClient({
  token: env.APIFY_API_KEY,
});

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

// Your profile context for OpenAI (matches n8n workflow)
const PROFILE_CONTEXT = `I'm looking for jobs. Your task is to filter them based on a list of attributes and skills that I have. Some jobs might not be relevant, which is why I want you to go through each of them and then let me know whether or not I'm an OK fit. Disregard my level of experience. Having 4 years of experience at my last job is somewhat irrelevant. Look more at the relevant technologies and if I have experience in them.

Below is block of context about me and my skills: 

# Matthew Calayo - Developer Profile for Job Filtering

## Professional Summary
Full-Stack Developer with 4+ years of professional experience at Counterpoint Consulting (August 2020 - October 2024) as Senior Software Engineer. Recent Computer Science graduate from University of Virginia (2016-2020) with proven track record in enterprise software development, architectural leadership, and modern web technologies.

## Core Technical Skills

### Programming Languages (Strong)
- **JavaScript/TypeScript** - Extensive professional and project experience
- **Java** - 4+ years professional experience with Spring framework
- **SQL** - Database design and optimization experience
- **HTML/CSS** - Advanced responsive design and modern CSS techniques

### Frontend Development (Strong)
- **React** - Professional experience and multiple personal projects
- **Next.js** - Current project experience with SSR and API routes
- **Solid.js** - Self-taught for performance optimization exploration
- **Tailwind CSS** - Modern styling approach
- **Mobile-First Design** - Responsive web design across devices
- **Single Page Applications (SPA)**
- **Server-Side Rendering (SSR)**

### Backend Development (Strong)
- **Node.js** - Full-stack JavaScript development
- **Spring Framework** (MVC, Spring Boot) - 4+ years professional experience
- **REST APIs** - Design and implementation
- **API Integration** - Third-party service integration
- **Web Scraping** - Automated data extraction (Apify API)
- **File Upload Systems** - Large file handling (512MB+)
- **Video Processing** - Media handling and optimization

### Databases & Cloud (Intermediate to Strong)
- **MongoDB** - NoSQL database experience
- **Supabase** - Modern backend-as-a-service with real-time capabilities
- **UploadThing** - Cloud storage integration
- **Cloud Storage Solutions** - Scalable media hosting

### Development Tools & Practices (Strong)
- **Git** - Version control and collaboration
- **Docker** - Containerization
- **Jira/Bitbucket/Bamboo** - Atlassian toolchain
- **ESLint** - Code quality and standards
- **Vercel** - Deployment and hosting
- **Agile Development** - CI/CD practices
- **AI-Assisted Development** - Claude Code and modern AI tools
- **Performance Optimization** - Video buffering, lazy loading
- **Technical Documentation** - Business model replication

## Professional Experience Highlights

### Senior Software Engineer (4+ years)
- **Enterprise Solutions**: Led development of document archiving solution with 20% efficiency improvement
- **Technical Leadership**: Architected proof-of-concept applications and reduced client onboarding by 5 days
- **Framework Development**: Redesigned proprietary JavaScript framework with React, reducing development time by 15%
- **Mission-Critical Applications**: Delivered Java Spring web applications under aggressive deadlines
- **UI/UX Development**: Created responsive interfaces meeting precise client specifications

### Current Projects (2025)
- **E-commerce Platform**: Full-stack TypeScript/React application with Supabase integration
- **Video Sharing Platform**: TikTok-style interface with automated scraping and cloud storage
- **AI Integration**: Generative AI for image creation and development acceleration

## Ideal Job Fit Criteria

### Strong Match (Should Apply)
- Full-Stack Developer roles requiring JavaScript/TypeScript + Java
- Frontend positions focusing on React/Next.js
- Backend roles with Spring Framework or Node.js
- Enterprise software development positions
- Positions requiring REST API development
- Roles involving video/media processing
- Cloud-native application development
- Agile/CI-CD environment positions

### Good Match (Consider)
- Frontend-only React/TypeScript positions
- Backend-only Java/Spring positions
- DevOps roles with Docker/CI-CD focus
- E-commerce development positions
- SaaS/Enterprise software companies
- Positions requiring MongoDB or modern databases

### Potential Concerns (Evaluate Carefully)
- Roles requiring extensive experience with technologies not listed above
- Positions requiring 5+ years in specific frameworks I have <2 years with
- Heavy mobile development (iOS/Android native)
- Data science/ML engineering (unless AI-assisted development focus)
- Legacy technology stacks significantly different from modern web development

## Years of Experience
- **Overall Software Development**: 4+ years professional + ongoing personal projects
- **Java/Spring**: 4+ years professional
- **JavaScript/React**: 4+ years professional + current projects
- **Full-Stack Development**: 4+ years
- **Fresh Graduate Consideration**: 2020 graduate, so suitable for mid-level to senior roles

## Location & Work Preferences
- Based in New York, NY
- Open to remote work (demonstrated with consulting experience)
- Comfortable with distributed teams and agile workflows`;

/**
 * Scrape jobs from LinkedIn using Apify
 * @param config - Apify configuration
 * @returns Array of raw job data
 */
export async function scrapeJobsFromLinkedIn(config: ApifyConfig): Promise<RawJob[]> {
  try {
    console.log("Starting job scraping with Apify...");
    
    //Run the LinkedIn job scraper
    const run = await apifyClient.actor("hKByXkMQaC5Qt9UMN").call({
      count: config.count,
      countryCode: config.countryCode,
      scrapeCompany: config.scrapeCompany,
      urls: config.urls,
    });

    //Get the dataset items
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    
    
    console.log(`Scraped ${items.length} jobs from LinkedIn`);
    
    // Validate and parse the raw job data
    const validJobs: RawJob[] = [];
    
    for (const item of items) {
      try {
        const validJob = rawJobSchema.parse(item);
        validJobs.push(validJob);
      } catch (error) {
        console.warn("Skipping invalid job data:", error);
      }
    }
    
    return validJobs;
  } catch (error) {
    console.error("Error scraping jobs with Apify:", error);
    throw new Error("Failed to scrape jobs from LinkedIn");
  }
}

/**
 * Evaluate a job using OpenAI
 * @param job - Raw job data
 * @returns Job evaluation result
 */
export async function evaluateJobWithOpenAI(job: RawJob): Promise<JobEvaluation | null> {
  try {
    const jobDescription = JSON.stringify(job);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You're a helpful, intelligent job filtering assistant.",
        },
        {
          role: "user",
          content: `${PROFILE_CONTEXT}

Here is the job description: 

${jobDescription}

--
Respond in this JSON format:
{"verdict":"true or false",
"reason":"",
"companyName":"",
"rating":1-10,
"skills":""}

If I'm a fit return true. If I'm not a fit return false (both strings)

Also give a short two sentence reasoning on the verdict either way. Why I am a good fit (what skills match or other reasons) or why I am a bad fit (missing skills, experience, etc.)

Return the company name

Return a rating 1-10 of how good of a fit I am for the job.

Return the primary skills that they are looking for in the job description.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate the JSON response
    const evaluationData = JSON.parse(responseContent);
    const evaluation = jobEvaluationSchema.parse(evaluationData);
    
    return evaluation;
  } catch (error) {
    console.error("Error evaluating job with OpenAI:", error);
    return null;
  }
}

/**
 * Convert raw job and evaluation to processed job format
 * @param rawJob - Raw job data from Apify
 * @param evaluation - Job evaluation from OpenAI
 * @returns Processed job data
 */
export function convertToProcessedJob(rawJob: RawJob, evaluation: JobEvaluation): ProcessedJob {
  return {
    role: rawJob.title,
    company: rawJob.companyName,
    location: rawJob.location,
    rating: evaluation.rating,
    reasonForMatch: evaluation.reason,
    companyWebsite: rawJob.companyWebsite ?? "",
    jobLink: rawJob.applyUrl ?? "",
    skills: evaluation.skills,
  };

/**
 * Process all jobs through the complete pipeline
 * @param options - Processing options
 * @returns Array of matching processed jobs
 */
export async function processJobsPipeline(
  options: JobProcessingOptions = {}
): Promise<ProcessedJob[]> {
  const {
    maxJobs = 100,
    skipDuplicates = true,
    onProgress,
  } = options;

  const matchingJobs: ProcessedJob[] = [];
  
  try {
    // Initialize sheets headers if needed
    await initializeSheetHeaders();
    
    // Get existing jobs for duplicate checking
    const existingJobs = skipDuplicates ? await readJobsFromSheet() : [];
    
    onProgress?.({
      isRunning: true,
      progress: 10,
      stage: "scraping",
      message: "Scraping jobs from LinkedIn...",
      jobsFound: 0,
      jobsMatched: 0,
    });

    // Configure Apify scraping
    const apifyConfig: ApifyConfig = {
      count: maxJobs,
      countryCode: 10,
      scrapeCompany: true,
      urls: [
        "https://www.linkedin.com/jobs/search/?currentJobId=4261151666&f_E=3%2C4&f_TPR=r86400&f_WT=1%2C2%2C3&geoId=105080838&keywords=software%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true"
      ],
    };

    // Scrape jobs
    const rawJobs = await scrapeJobsFromLinkedIn(apifyConfig);
    
    onProgress?.({
      isRunning: true,
      progress: 30,
      stage: "evaluating",
      message: "Evaluating job matches with AI...",
      jobsFound: rawJobs.length,
      jobsMatched: 0,
    });

    // Process each job
    for (let i = 0; i < rawJobs.length; i++) {
      const job = rawJobs[i];
      if (!job) continue;

      // Skip duplicates if enabled
      if (skipDuplicates && isDuplicateJob(existingJobs, job.applyUrl)) {
        console.log(`Skipping duplicate job: ${job.title} at ${job.companyName}`);
        continue;
      }

      // Evaluate job with OpenAI
      const evaluation = await evaluateJobWithOpenAI(job);
      
      if (evaluation && evaluation.verdict === "true") {
        const processedJob = convertToProcessedJob(job, evaluation);
        matchingJobs.push(processedJob);
      }

      // Update progress
      const progress = 30 + (i / rawJobs.length) * 50;
      onProgress?.({
        isRunning: true,
        progress,
        stage: "evaluating",
        message: `Evaluated ${i + 1}/${rawJobs.length} jobs...`,
        jobsFound: rawJobs.length,
        jobsMatched: matchingJobs.length,
      });

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    onProgress?.({
      isRunning: true,
      progress: 85,
      stage: "saving",
      message: "Saving matching jobs to Google Sheets...",
      jobsFound: rawJobs.length,
      jobsMatched: matchingJobs.length,
    });

    // Save matching jobs to Google Sheets
    if (matchingJobs.length > 0) {
      await appendJobsToSheet(matchingJobs);
    }

    onProgress?.({
      isRunning: false,
      progress: 100,
      stage: "completed",
      message: `Completed! Found ${matchingJobs.length} matching jobs.`,
      jobsFound: rawJobs.length,
      jobsMatched: matchingJobs.length,
    });

    return matchingJobs;
  } catch (error) {
    console.error("Error in job processing pipeline:", error);
    
    onProgress?.({
      isRunning: false,
      progress: 0,
      stage: "error",
      message: "Job processing failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

/**
 * Default LinkedIn search URL generator
 * @returns Default search URL for software engineer positions
 */
export function getDefaultLinkedInSearchUrl(): string {
  return "https://www.linkedin.com/jobs/search/?currentJobId=4262182602&f_E=3%2C4&f_TPR=r604800&f_WT=1%2C2%2C3&geoId=105080838&keywords=software%20engineer&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true";
}