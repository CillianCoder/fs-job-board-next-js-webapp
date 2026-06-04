"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, User, Mail, Phone, Link2, Code2, FileText, ExternalLink,
  X, Loader2, ChevronLeft, ChevronRight, Briefcase, Info, Award
} from "lucide-react";

interface CandidateProfileItem {
  id: string;
  name: string;
  phone: string | null;
  resumeUrl: string | null;
  linkedin: string | null;
  github: string | null;
  experience: string | null;
  coverLetter: string | null;
  createdAt: Date;
  user: {
    email: string;
  };
}

interface CandidatesTableProps {
  candidates: CandidateProfileItem[];
  totalCandidates: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function CandidatesTable({
  candidates,
  totalCandidates,
  totalPages,
  currentPage,
  limit
}: CandidatesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [expFilter, setExpFilter] = useState(searchParams.get("experience") || "");
  const [pageSize, setPageSize] = useState(limit.toString());
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfileItem | null>(null);

  const applyFilters = (queryStr = searchVal, expStr = expFilter, limitStr = pageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (queryStr.trim()) params.set("q", queryStr.trim());
    else params.delete("q");
    
    if (expStr) params.set("experience", expStr);
    else params.delete("experience");
    
    params.set("limit", limitStr);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin-dashboard/candidates?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin-dashboard/candidates?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const getExperienceLabel = (exp: string | null) => {
    if (!exp) return "Not specified";
    switch (exp) {
      case "0-1": return "Less than 1 year";
      case "1-3": return "1 – 3 years";
      case "3-5": return "3 – 5 years";
      case "5-10": return "5 – 10 years";
      case "10+": return "10+ years";
      default: return exp;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Filters Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-foreground self-start md:self-center">Candidate Profiles</h2>
        
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          
          {/* Search by name/email */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Experience level select */}
          <div className="relative">
            <select
              value={expFilter}
              onChange={(e) => {
                setExpFilter(e.target.value);
                applyFilters(searchVal, e.target.value, pageSize);
              }}
              className="w-full sm:w-44 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Experience Levels</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1 – 3 years</option>
              <option value="3-5">3 – 5 years</option>
              <option value="5-10">5 – 10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          {/* Page size limit */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                applyFilters(searchVal, expFilter, e.target.value);
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
              <th className="px-6 py-4">Developer</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Experience</th>
              <th className="px-6 py-4">Resume</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
            {candidates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                  No candidate profiles found.
                </td>
              </tr>
            ) : (
              candidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {cand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{cand.name}</span>
                  </td>
                  <td className="px-6 py-4 text-foreground/75 font-mono">{cand.user.email}</td>
                  <td className="px-6 py-4 text-foreground/75">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                      {getExperienceLabel(cand.experience)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {cand.resumeUrl ? (
                      <a
                        href={cand.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-bold border border-green-200 dark:border-green-800/60 bg-green-50/50 dark:bg-green-950/20 px-2 py-0.5 rounded-full"
                      >
                        <FileText className="w-3 h-3" />
                        View CV
                      </a>
                    ) : (
                      <span className="text-xs text-foreground/35 italic">No resume</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
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
            <span className="font-semibold text-foreground">{totalPages}</span> ({totalCandidates} total candidates)
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
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-150 dark:border-gray-850 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-605 flex items-center justify-center font-bold text-sm shrink-0">
                  {selectedCandidate.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedCandidate.name}</h3>
                  <p className="text-xs text-foreground/50">Developer Profile Details</p>
                </div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6 overflow-y-auto flex-1">
              
              {/* Contact info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Email */}
                <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                  <Mail className="w-4.5 h-4.5 text-foreground/45 shrink-0 mt-0.5" />
                  <div className="overflow-hidden">
                    <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Email Address</h4>
                    <p className="text-xs font-semibold text-foreground font-mono block truncate mt-0.5">{selectedCandidate.user.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                  <Phone className="w-4.5 h-4.5 text-foreground/45 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Phone</h4>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedCandidate.phone || "Not provided"}</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-start gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                  <Award className="w-4.5 h-4.5 text-foreground/45 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Experience Level</h4>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{getExperienceLabel(selectedCandidate.experience)}</p>
                  </div>
                </div>

              </div>

              {/* Developer Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* LinkedIn */}
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-xs font-semibold">
                  <Link2 className="w-4.5 h-4.5 text-blue-600" />
                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">LinkedIn</span>
                    {selectedCandidate.linkedin ? (
                      <a href={selectedCandidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block mt-0.5">
                        {selectedCandidate.linkedin.replace("https://", "").replace("www.linkedin.com/in/", "linkedin:")}
                      </a>
                    ) : (
                      <span className="text-foreground/40 block mt-0.5">Not linked</span>
                    )}
                  </div>
                </div>

                {/* GitHub */}
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-xs font-semibold">
                  <Code2 className="w-4.5 h-4.5 text-gray-800 dark:text-gray-200" />
                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">GitHub</span>
                    {selectedCandidate.github ? (
                      <a href={selectedCandidate.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block mt-0.5">
                        {selectedCandidate.github.replace("https://", "").replace("github.com/", "")}
                      </a>
                    ) : (
                      <span className="text-foreground/40 block mt-0.5">Not linked</span>
                    )}
                  </div>
                </div>

                {/* Resume download */}
                <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-xs font-semibold">
                  <FileText className="w-4.5 h-4.5 text-green-600" />
                  <div className="overflow-hidden flex-1">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">Resume / CV</span>
                    {selectedCandidate.resumeUrl ? (
                      <a
                        href={selectedCandidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 mt-0.5 font-bold"
                      >
                        View CV <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-foreground/40 block mt-0.5">Not uploaded</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Cover Letter */}
              <div>
                <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">Cover Letter / Bio</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-xl text-sm leading-relaxed text-foreground/85 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedCandidate.coverLetter || "No cover letter or summary text submitted by this candidate."}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedCandidate(null)}
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
