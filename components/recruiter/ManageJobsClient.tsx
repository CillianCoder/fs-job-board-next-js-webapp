"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  X,
  MapPin,
  Briefcase,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Job } from "@prisma/client";
import { deleteJob } from "@/app/actions/delete-job";

interface ManageJobsClientProps {
  jobs: (Job & {
    _count?: {
      applications: number;
    };
  })[];
  totalPages: number;
  totalJobs: number;
  currentPage: number;
  locations: string[];
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote"];

export default function ManageJobsClient({
  jobs,
  totalPages,
  totalJobs,
  currentPage,
  locations,
}: ManageJobsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for instant input feedback
  const [searchInput, setSearchInput] = useState(searchParams.get("query") || "");
  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  // States for delete action
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [isDeletePending, setIsDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const selectedType = searchParams.get("type") || "All";
  const selectedLocation = searchParams.get("location") || "All";

  // Debounce search query to avoid overloading database / server updates
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      updateUrlParams({ query: searchInput, page: "1" });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchInput(searchParams.get("query") || "");
  }, [searchParams]);

  // Function to dynamically merge and update URL Search Params
  const updateUrlParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "All" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Default to page 1 if not specified
    if (!updates.page && !params.get("page")) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateUrlParams({ page: String(currentPage - 1) });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateUrlParams({ page: String(currentPage + 1) });
    }
  };

  // Perform job deletion asynchronously
  const handleConfirmDelete = async () => {
    if (!deletingJob) return;

    setIsDeletePending(true);
    setDeleteError(null);

    try {
      const result = await deleteJob(deletingJob.id);
      if (result.success) {
        setDeletingJob(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDeleteError(result.error ?? "Failed to delete the job listing.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeletePending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-outfit">Manage Jobs</h1>
          <p className="text-foreground/60 mt-1">Create, review, and manage your posted engineering positions.</p>
        </div>
        <Link
          href="/recruiter-dashboard/manage-jobs/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-primary/20 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by role, company, or keywords..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
            />
          </div>

          {/* Select Options */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            <div className="flex items-center gap-2 text-xs text-foreground/50 font-semibold uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              Filters:
            </div>
            
            {/* Job Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => updateUrlParams({ type: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="All">All Types</option>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              value={selectedLocation}
              onChange={(e) => updateUrlParams({ location: e.target.value, page: "1" })}
              className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {(searchInput || selectedType !== "All" || selectedLocation !== "All") && (
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors px-2 py-1 cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Table Panel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Job Role</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Company</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Location</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Salary</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50">Applications</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {job.title}
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {job.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-foreground/70"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.tags.length > 3 && (
                            <span className="text-xs text-foreground/40 self-center">
                              +{job.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground/80">{job.company}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-sm text-foreground/70">
                        <MapPin className="w-4 h-4 mr-1 text-foreground/40 shrink-0" />
                        {job.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground/80">{job.salary}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20">
                        {job.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {job._count?.applications ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview Button */}
                        <button
                          onClick={() => setPreviewJob(job)}
                          title="Preview Job Listing"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary/30 text-foreground/60 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all cursor-pointer"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {/* Edit Button */}
                        <Link
                          href={`/recruiter-dashboard/manage-jobs/${job.id}/edit`}
                          title="Edit Job Listing"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-amber-500/30 text-foreground/60 hover:text-amber-500 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </Link>
                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingJob(job)}
                          title="Delete Job Listing"
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-red-500/30 text-foreground/60 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground/50">
                    No active job listings found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {totalJobs > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-foreground/50">
              Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * 6 + 1, totalJobs)}</span> to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(currentPage * 6, totalJobs)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{totalJobs}</span> positions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => updateUrlParams({ page: String(pageNumber) })}
                    className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Pop-up Modal (Job Detail Preview) */}
      {previewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Live Preview
                </span>
                <span className="text-xs text-foreground/40">
                  Matches your public-facing details template
                </span>
              </div>
              <button
                onClick={() => setPreviewJob(null)}
                className="p-1 rounded-lg text-foreground/40 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Header Banner */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200/60 dark:border-gray-800/60 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex gap-4 sm:gap-6 items-start">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xl sm:text-2xl text-primary shrink-0 shadow-sm border border-primary/20">
                      {previewJob.company.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-2 text-foreground">
                        {previewJob.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-foreground/70 text-xs sm:text-sm font-medium">
                        <span className="flex items-center text-primary">
                          <Building2 className="w-4 h-4 mr-1.5" /> {previewJob.company}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5" /> {previewJob.location}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1.5" /> {previewJob.salary}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" /> Posted {new Date(previewJob.postedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Content Body */}
              <div className="p-6 sm:p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    {/* Role Description */}
                    <div className="space-y-4">
                      <h2 className="text-lg font-bold text-foreground">About the Role</h2>
                      <div className="prose dark:prose-invert max-w-none text-foreground/80 text-sm sm:text-base space-y-4 leading-relaxed">
                        {previewJob.description ? (
                          <div className="whitespace-pre-line leading-relaxed text-sm sm:text-base">
                            {previewJob.description}
                          </div>
                        ) : (
                          <>
                            <p>
                              We are looking for a passionate and experienced{" "}
                              <strong>{previewJob.title}</strong> to join our team at {previewJob.company}
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

                            <h3 className="text-base sm:text-lg font-semibold mt-6 mb-2 text-foreground">
                              Responsibilities
                            </h3>
                            <ul className="list-disc pl-5 space-y-1.5">
                              <li>Design, develop, and maintain robust software solutions.</li>
                              <li>Collaborate with cross-functional teams to define, design, and ship new features.</li>
                              <li>Identify and correct bottlenecks and fix bugs.</li>
                              <li>Help maintain code quality, organization, and automatization.</li>
                              <li>Mentoring junior developers and conducting code reviews.</li>
                            </ul>

                            <h3 className="text-base sm:text-lg font-semibold mt-6 mb-2 text-foreground">
                              Requirements
                            </h3>
                            <ul className="list-disc pl-5 space-y-1.5">
                              <li>Proven experience working as a {previewJob.title} or similar role.</li>
                              <li>Deep knowledge of best practices in software architecture and design.</li>
                              <li>Experience working in an agile development environment.</li>
                              <li>Excellent communication and teamwork skills.</li>
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Summary Sidebar */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                      <h3 className="font-bold text-sm sm:text-base text-foreground mb-4">Job Summary</h3>
                      <div className="space-y-4 text-sm">
                        <div>
                          <p className="text-foreground/50 text-xs mb-0.5">Employment Type</p>
                          <p className="font-medium text-foreground">{previewJob.type}</p>
                        </div>
                        <div>
                          <p className="text-foreground/50 text-xs mb-0.5">Location</p>
                          <p className="font-medium text-foreground">{previewJob.location}</p>
                        </div>
                        <div>
                          <p className="text-foreground/50 text-xs mb-0.5">Salary Range</p>
                          <p className="font-medium text-foreground">{previewJob.salary}</p>
                        </div>
                      </div>

                      <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-3">Required Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {previewJob.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 text-xs font-medium text-foreground/80"
                            >
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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end shrink-0">
              <button
                onClick={() => setPreviewJob(null)}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Pop-up Modal (Delete Confirmation) */}
      {deletingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-xl font-bold text-foreground font-outfit">Delete Job Listing?</h3>
              </div>
              
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                Are you sure you want to delete the job listing for <strong className="text-foreground">{deletingJob.title}</strong> at <strong className="text-foreground">{deletingJob.company}</strong>?
              </p>
              
              <p className="text-xs text-foreground/50 leading-relaxed bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-200/50 dark:border-gray-800/50 mb-4">
                Warning: This action will permanently delete the job and all associated applications from the database. This action is completely irreversible.
              </p>

              {deleteError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-3 rounded-lg flex gap-2 items-start text-xs text-red-600 dark:text-red-400 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setDeletingJob(null);
                    setDeleteError(null);
                  }}
                  disabled={isDeletePending}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-semibold text-foreground/70 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeletePending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-red-600/20 cursor-pointer"
                >
                  {isDeletePending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Listing"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
