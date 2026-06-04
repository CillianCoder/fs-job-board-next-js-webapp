"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, Building2, Globe2, Mail, ExternalLink, Calendar,
  X, Loader2, ChevronLeft, ChevronRight, Briefcase, Info
} from "lucide-react";

interface JobItem {
  id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  postedAt: Date;
}

interface EmployerItem {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  jobs: JobItem[];
  _count: {
    jobs: number;
  };
}

interface RecruitersTableProps {
  recruiters: EmployerItem[];
  totalRecruiters: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function RecruitersTable({
  recruiters,
  totalRecruiters,
  totalPages,
  currentPage,
  limit
}: RecruitersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [pageSize, setPageSize] = useState(limit.toString());
  const [selectedEmployer, setSelectedEmployer] = useState<EmployerItem | null>(null);

  const applyFilters = (queryStr = searchVal, limitStr = pageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (queryStr.trim()) params.set("q", queryStr.trim());
    else params.delete("q");
    
    params.set("limit", limitStr);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin-dashboard/recruiters?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin-dashboard/recruiters?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-foreground self-start sm:self-center">Recruiter Directory</h2>
        
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search company or representative..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                applyFilters(searchVal, e.target.value);
              }}
              className="w-full sm:w-24 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Filter
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs font-bold text-foreground/60 uppercase tracking-wider">
              <th className="px-6 py-4">Company Name</th>
              <th className="px-6 py-4">Representative</th>
              <th className="px-6 py-4">Website</th>
              <th className="px-6 py-4">Active Jobs</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
            {recruiters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                  No recruiters registered yet.
                </td>
              </tr>
            ) : (
              recruiters.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {emp.logoUrl ? (
                        <img src={emp.logoUrl} alt={emp.name} className="w-full h-full object-cover" />
                      ) : (
                        emp.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span>{emp.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{emp.user.name || "HR Rep"}</div>
                    <div className="text-xs text-foreground/50 font-mono">{emp.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-foreground/75">
                    {emp.website ? (
                      <a
                        href={emp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        {emp.website.replace("https://", "").replace("http://", "")}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-foreground/40">Not provided</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60">
                      {emp._count.jobs} Job(s)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedEmployer(emp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold text-foreground hover:bg-gray-50 dark:hover:bg-gray-950 transition-all cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm text-foreground/50 font-medium">
            Showing Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({totalRecruiters} total recruiters)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ─── DETAIL VIEW MODAL ─── */}
      {/* ========================================== */}
      {selectedEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEmployer(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-150 dark:border-gray-850 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center font-bold text-sm overflow-hidden">
                  {selectedEmployer.logoUrl ? (
                    <img src={selectedEmployer.logoUrl} alt={selectedEmployer.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedEmployer.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedEmployer.name}</h3>
                  <p className="text-xs text-foreground/50">Company Profile Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployer(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Meta details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Website */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl">
                  <Globe2 className="w-5 h-5 text-foreground/45 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Website</h4>
                    {selectedEmployer.website ? (
                      <a
                        href={selectedEmployer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-semibold block break-all mt-0.5"
                      >
                        {selectedEmployer.website}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-foreground/50 block mt-0.5">Not specified</span>
                    )}
                  </div>
                </div>

                {/* Rep info */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl">
                  <Mail className="w-5 h-5 text-foreground/45 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Representative</h4>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{selectedEmployer.user.name || "N/A"}</p>
                    <p className="text-xs text-foreground/50 font-mono block break-all">{selectedEmployer.user.email}</p>
                  </div>
                </div>

              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Company Description</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-sm leading-relaxed text-foreground/85">
                  {selectedEmployer.description || "No description provided for this company."}
                </div>
              </div>

              {/* Jobs posted */}
              <div>
                <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Posted Job Listings ({selectedEmployer.jobs.length})
                </h4>
                
                {selectedEmployer.jobs.length === 0 ? (
                  <p className="text-sm text-foreground/50 italic pl-1">No jobs posted by this employer yet.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedEmployer.jobs.map((job) => (
                      <div key={job.id} className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl flex justify-between items-center text-sm">
                        <div>
                          <p className="font-bold text-foreground">{job.title}</p>
                          <p className="text-xs text-foreground/50 mt-0.5">{job.location} · {job.type} · {job.salary}</p>
                        </div>
                        <span className="text-[10px] text-foreground/45 flex items-center gap-1 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(job.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedEmployer(null)}
                className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition-all shadow-md"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
