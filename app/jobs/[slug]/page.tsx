import { getJobBySlug } from "@/lib/jobs";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
} from "lucide-react";
import ApplyModal from "@/components/jobs/ApplyModal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job Not Found | Devforge" };
  }

  return {
    title: `${job.title} at ${job.company} | Devforge`,
    description: `Apply for ${job.title} at ${job.company}.`,
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  // Formatting date for display
  const postedDate = new Date(job.postedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gray-50 dark:bg-background min-h-screen pb-20 flex-1">
      {/* Header Banner */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to all jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex gap-6 items-start">
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-2xl text-gray-500 shrink-0 shadow-sm border border-gray-200 dark:border-gray-700">
                {job.company.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-foreground/70 text-sm font-medium">
                  <span className="flex items-center text-primary">
                    <Building2 className="w-4 h-4 mr-2" /> {job.company}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> {job.location}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" /> {job.salary}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" /> Posted {postedDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 mt-4 md:mt-0">
              <ApplyModal
                jobId={job.id}
                jobTitle={job.title}
                company={job.company}
              />
              <button className="px-8 py-3 rounded-lg bg-white dark:bg-gray-800 text-foreground border border-gray-200 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Save Job
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Job Description */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4">About the Role</h2>
              <div className="prose dark:prose-invert max-w-none text-foreground/80 space-y-4">
                <p>
                  We are looking for a passionate and experienced{" "}
                  <strong>{job.title}</strong> to join our team at {job.company}
                  . In this role, you will be responsible for building scalable,
                  high-performance applications that serve millions of users.
                </p>
                <p>
                  You will work closely with product managers, designers, and
                  other engineers to deliver impactful features. The ideal
                  candidate has a strong foundation in software engineering,
                  excellent problem-solving skills, and a track record of
                  delivering quality software.
                </p>

                <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
                  Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Design, develop, and maintain robust software solutions.
                  </li>
                  <li>
                    Collaborate with cross-functional teams to define, design,
                    and ship new features.
                  </li>
                  <li>Identify and correct bottlenecks and fix bugs.</li>
                  <li>
                    Help maintain code quality, organization, and
                    automatization.
                  </li>
                  <li>
                    Mentoring junior developers and conducting code reviews.
                  </li>
                </ul>

                <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
                  Requirements
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Proven experience working as a {job.title} or similar role.
                  </li>
                  <li>
                    Deep knowledge of best practices in software architecture
                    and design.
                  </li>
                  <li>
                    Experience working in an agile development environment.
                  </li>
                  <li>Excellent communication and teamwork skills.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Job Summary Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Job Summary</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60 mb-1">
                    Employment Type
                  </p>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-1">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60 mb-1">
                    Salary Range
                  </p>
                  <p className="font-medium">{job.salary}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-3 py-1 text-sm font-medium text-foreground/80">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
