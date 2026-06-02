"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";

interface Job {
  id: string;
  title: string;
}

interface ApplicationsFilterProps {
  jobs: Job[];
}

export default function ApplicationsFilter({ jobs }: ApplicationsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [jobId, setJobId] = useState(searchParams.get("jobId") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "");

  const statuses = ["NEW", "REVIEWING", "SHORTLISTED", "APPROVED", "REJECTED"];

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (jobId) params.set("jobId", jobId);
    if (searchQuery) params.set("search", searchQuery);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setStatus("");
    setJobId("");
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    router.push("?page=1");
  };

  const hasActiveFilters = status || jobId || searchQuery || dateFrom || dateTo;

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-foreground font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Filter className="w-4 h-4" />
        Filters {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Active</span>}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Filter */}
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">
                Job
              </label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Jobs</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Query */}
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">
                Search (Name or Email)
              </label>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">
                Applied From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-2">
                Applied To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handleFilter}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-foreground font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
