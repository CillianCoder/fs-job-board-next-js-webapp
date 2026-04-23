import { jobs, Job } from "@/data/jobs";

export interface GetJobsParams {
  query?: string;
  location?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface GetJobsResult {
  jobs: Job[];
  totalPages: number;
  totalJobs: number;
  currentPage: number;
}

/**
 * Returns all jobs without filtering.
 */
export async function getAllJobs(): Promise<Job[]> {
  // Simulating an async DB/API call
  return jobs;
}

/**
 * Returns a specific job by ID.
 */
export async function getJobById(id: string): Promise<Job | null> {
  const job = jobs.find((j) => j.id === id);
  return job || null;
}

/**
 * Returns filtered and paginated jobs.
 */
export async function getJobs(params: GetJobsParams = {}): Promise<GetJobsResult> {
  const {
    query = "",
    location = "",
    type = "",
    page = 1,
    limit = 9
  } = params;

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = query === "" || 
      job.title.toLowerCase().includes(query.toLowerCase()) || 
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
    const matchesLocation = location === "" || job.location.toLowerCase().includes(location.toLowerCase());
    const matchesType = type === "" || job.type === type;
    
    return matchesQuery && matchesLocation && matchesType;
  });

  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / limit);
  
  // Ensure page is within bounds
  const validPage = Math.max(1, Math.min(page, totalPages > 0 ? totalPages : 1));
  
  const currentJobs = filteredJobs.slice((validPage - 1) * limit, validPage * limit);

  return {
    jobs: currentJobs,
    totalPages,
    totalJobs,
    currentPage: validPage
  };
}
