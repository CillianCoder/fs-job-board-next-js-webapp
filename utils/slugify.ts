import { Job } from "@/data/jobs";

export function generateJobSlug(job: Job): string {
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
