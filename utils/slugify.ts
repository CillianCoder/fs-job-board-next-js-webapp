import { Job } from "@prisma/client";

export function generateJobSlug(job: Pick<Job, "title" | "company" | "id">): string {
  const base = `${job.title} ${job.company}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${base}-${job.id}`;
}

export function extractIdFromSlug(slug: string): string {
  const parts = slug.split('-');
  return parts[parts.length - 1];
}
