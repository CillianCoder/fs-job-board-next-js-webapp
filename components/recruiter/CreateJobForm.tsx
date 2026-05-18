"use client";

import { useActionState, useState, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/app/actions/create-job";
import { editJob } from "@/app/actions/edit-job";
import { Category, Job } from "@prisma/client";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Tag,
  FolderOpen,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText
} from "lucide-react";
import Link from "next/link";

interface CreateJobFormProps {
  categories: Category[];
  job?: Job; // Optional job prop for Edit mode
}

const FALLBACK_CATEGORIES = [
  { id: "Engineering", name: "Engineering" },
  { id: "Mobile", name: "Mobile" },
  { id: "Data & AI", name: "Data & AI" },
  { id: "DevOps & Cloud", name: "DevOps & Cloud" },
  { id: "Design & Product", name: "Design & Product" },
  { id: "QA & Testing", name: "QA & Testing" },
  { id: "Security", name: "Security" }
];

export default function CreateJobForm({ categories, job }: CreateJobFormProps) {
  const router = useRouter();
  const isEditMode = !!job;

  // React 19 Action State Hook - branches depending on Create vs Edit mode
  const [state, formAction, isPending] = useActionState(
    isEditMode ? editJob : createJob,
    { success: false }
  );

  // Client-side dynamic states for tag rendering (pre-populated in Edit mode)
  const [tagInput, setTagInput] = useState(job ? job.tags.join(", ") : "");
  const [renderedTags, setRenderedTags] = useState<string[]>([]);
  
  // Decide active categories (fallback if DB hasn't been seeded)
  const activeCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  // Auto-parse comma separated inputs into a premium visual list of tags
  useEffect(() => {
    const list = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setRenderedTags(list);
  }, [tagInput]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  // If success, display the premium celebration screen
  if (state.success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 sm:p-12 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3 font-outfit">
            {isEditMode ? "Job Listing Updated!" : "Job Posted Successfully!"}
          </h1>
          <p className="text-foreground/60 max-w-md mx-auto mb-8 leading-relaxed text-sm sm:text-base">
            {isEditMode
              ? "Your changes have been fully synchronized with the database and are now live for applicants."
              : "Your new career listing is now live in the developer community and linked correctly within your database!"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/recruiter-dashboard/manage-jobs"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-colors shadow-sm cursor-pointer"
            >
              Go to Manage Jobs
            </Link>
            {!isEditMode && (
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-800 text-foreground/80 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors cursor-pointer"
              >
                Post Another Job
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-5 max-w-3xl">
      {/* Back button link */}
      <Link
        href="/recruiter-dashboard/manage-jobs"
        className="inline-flex items-center text-sm font-medium text-foreground/60 hover:text-primary transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
        Back to Manage Jobs
      </Link>

      {/* Header Description */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-outfit">
          {isEditMode ? `Edit Job Listing: ${job.title}` : "Post a New Job Role"}
        </h1>
        <p className="text-foreground/60 mt-1">
          {isEditMode
            ? "Update fields, thresholds, tags, and custom requirements. Changes will update instantly."
            : "Fill in all requirements, salary thresholds, and matching tags to capture senior engineering talents."}
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Hidden field to submit job ID for edits */}
        {isEditMode && <input type="hidden" name="id" value={job.id} />}

        {/* Global Error Notice */}
        {state.globalError && (
          <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800 p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">{state.globalError}</span>
          </div>
        )}

        <div className="p-6 sm:p-6 space-y-6">
          {/* Section 1: Job Meta Info */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Job Listing Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Job Title */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-foreground/85 mb-2">Job Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Senior Frontend Engineer"
                  defaultValue={job?.title ?? ""}
                  className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                    state.errors?.title
                      ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                />
                {state.errors?.title && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.title}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground/85 mb-2">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40" />
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. TechCorp Inc."
                    defaultValue={job?.company ?? ""}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                      state.errors?.company
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  />
                </div>
                {state.errors?.company && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.company}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-foreground/85 mb-2">Category</label>
                <div className="relative">
                  <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40 z-10" />
                  <select
                    name="categoryId"
                    defaultValue={job?.categoryId ?? "default"}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm cursor-pointer ${
                      state.errors?.categoryId
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <option value="default" disabled>Select Category</option>
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {state.errors?.categoryId && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.categoryId}
                  </p>
                )}
              </div>

              {/* Job Location */}
              <div>
                <label className="block text-sm font-semibold text-foreground/85 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40" />
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Remote or Austin, TX (Hybrid)"
                    defaultValue={job?.location ?? ""}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                      state.errors?.location
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  />
                </div>
                {state.errors?.location && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.location}
                  </p>
                )}
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-semibold text-foreground/85 mb-2">Salary Range</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground/40" />
                  <input
                    type="text"
                    name="salary"
                    placeholder="e.g. $120k - $150k"
                    defaultValue={job?.salary ?? ""}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                      state.errors?.salary
                        ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  />
                </div>
                {state.errors?.salary && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.salary}
                  </p>
                )}
              </div>

              {/* Job Type Radio Option */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-foreground/85 mb-3">Employment Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["Full-time", "Part-time", "Contract", "Remote"].map((typeOption) => (
                    <label
                      key={typeOption}
                      className="flex items-center justify-center gap-2 px-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer text-sm font-semibold text-foreground/80"
                    >
                      <input
                        type="radio"
                        name="type"
                        value={typeOption}
                        defaultChecked={job ? typeOption === job.type : typeOption === "Full-time"}
                        className="accent-primary"
                      />
                      {typeOption}
                    </label>
                  ))}
                </div>
                {state.errors?.type && (
                  <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {state.errors.type}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Skills & Tags */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Skills & Tags</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/85 mb-2">Required Skills (Comma separated)</label>
              <textarea
                name="tags"
                rows={2}
                placeholder="e.g. React, Next.js, Node.js, TypeScript"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                  state.errors?.tags
                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              />
              <p className="text-xs text-foreground/40 mt-1.5 leading-relaxed">
                Separate each skill tag with a comma. We'll automatically parse these into styled tags on your live details page.
              </p>

              {/* Premium Live Tag Previewer */}
              {renderedTags.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200/50 dark:border-gray-800/50 rounded-xl">
                  <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2.5">
                    Live Tag Preview:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {renderedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 animate-in fade-in duration-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {state.errors?.tags && (
                <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {state.errors.tags}
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Job Description Textarea */}
          <div className="space-y-4">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg font-bold text-foreground">Detailed Job Description</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/85 mb-2">Job Description Details (Optional)</label>
              <textarea
                name="description"
                rows={6}
                defaultValue={job?.description ?? ""}
                placeholder="Describe roles, responsibilities, engineering environment, benefits and expectations..."
                className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm ${
                  state.errors?.description
                    ? "border-red-500 focus:ring-red-500/10 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-800"
                }`}
              />
              <p className="text-xs text-foreground/40 mt-1.5 leading-relaxed">
                Provide comprehensive insights about the engineering environment, day-to-day operations, and technical stack details to engage qualified engineers. If left blank, a highly stylized standard engineering role description will be automatically rendered on the details page.
              </p>

              {state.errors?.description && (
                <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {state.errors.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-end">
          <Link
            href="/recruiter-dashboard/manage-jobs"
            className="w-full sm:w-auto text-center px-5 py-2.5 text-sm font-semibold text-foreground/75 hover:text-foreground border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? "Saving Changes..." : "Posting Listing..."}
              </>
            ) : (
              isEditMode ? "Save Changes" : "Post Job Listing"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
