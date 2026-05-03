import prisma from "@/lib/prisma";
import { Job, Prisma } from "@prisma/client";

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
  return prisma.job.findMany({
    orderBy: { postedAt: "desc" }
  });
}

/**
 * Returns a specific job by ID.
 */
export async function getJobById(id: string): Promise<Job | null> {
  return prisma.job.findUnique({
    where: { id }
  });
}

/**
 * Returns a specific job by slug.
 */
export async function getJobBySlug(slug: string): Promise<Job | null> {
  return prisma.job.findUnique({
    where: { slug }
  });
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

  const where: Prisma.JobWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } }
    ];
  }

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (type) {
    where.type = type;
  }

  const totalJobs = await prisma.job.count({ where });
  const totalPages = Math.ceil(totalJobs / limit);
  const validPage = Math.max(1, Math.min(page, totalPages > 0 ? totalPages : 1));

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { postedAt: "desc" },
    skip: (validPage - 1) * limit,
    take: limit
  });

  return {
    jobs,
    totalPages,
    totalJobs,
    currentPage: validPage
  };
}

/**
 * Returns an array of unique locations for dropdown filters.
 */
export async function getUniqueLocations(): Promise<string[]> {
  const distinctLocations = await prisma.job.findMany({
    select: { location: true },
    distinct: ['location']
  });
  return distinctLocations.map(j => j.location);
}
