import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { Job } from "@prisma/client";
import { generateJobSlug } from "@/utils/slugify";

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.slug}`} className="block h-full group">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xl text-gray-500">
            {job.company.charAt(0)}
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {job.type}
          </span>
        </div>
        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <p className="text-foreground/70 mb-4">{job.company}</p>
        <div className="flex flex-col gap-2 mb-6 text-sm text-foreground/60">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" /> {job.location}
          </div>
          <div className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" /> {job.salary}
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag, j) => (
              <span
                key={j}
                className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-foreground/70">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
