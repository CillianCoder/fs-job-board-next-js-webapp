import {
  ChevronLeft,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
} from "lucide-react";
import Link from "next/link";

export default function JobDetailsLoading() {
  return (
    <div className="bg-gray-50 dark:bg-background min-h-screen pb-20 flex-1">
      {/* Header Banner Skeleton */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors mb-8">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to all jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 animate-pulse">
            <div className="flex gap-6 items-start w-full">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800 shrink-0 border border-gray-100 dark:border-gray-700"></div>
              <div className="w-full">
                <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 md:w-1/2 mb-4"></div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-36"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 mt-4 md:mt-0">
              <div className="w-full sm:w-[136px] h-[48px] rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-full sm:w-[114px] h-[48px] rounded-lg bg-gray-200 dark:bg-gray-800"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8 animate-pulse">
            {/* Job Description Skeleton */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
              <div className="h-7 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-6"></div>

              <div className="space-y-4 mb-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-11/12"></div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-10/12"></div>
              </div>

              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-40 mt-8 mb-4"></div>
              <div className="space-y-3 pl-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                  </div>
                ))}
              </div>

              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-36 mt-8 mb-4"></div>
              <div className="space-y-3 pl-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 animate-pulse">
            {/* Job Summary Card Skeleton */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-6"></div>

              <div className="space-y-6">
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-2"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-36"></div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="w-16 h-7 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="w-24 h-7 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="w-20 h-7 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="w-14 h-7 rounded bg-gray-200 dark:bg-gray-800"></div>
                  <div className="w-18 h-7 rounded bg-gray-200 dark:bg-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
