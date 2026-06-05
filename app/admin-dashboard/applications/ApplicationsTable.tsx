"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  FileText,
  User,
  Mail,
  Phone,
  Link2,
  Code2,
  Calendar,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Info,
  AlertCircle,
  Building2,
  CheckCircle2,
  MessageSquare,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import {
  deleteApplicationAdminAction,
  updateApplicationStatusAdminAction,
} from "@/app/actions/admin";

interface JobInfo {
  id: string;
  title: string;
  company: string;
}

interface ApplicationItem {
  id: string;
  jobId: string;
  job: JobInfo;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string;
  linkedin: string | null;
  github: string | null;
  experience: string | null;
  coverLetter: string | null;
  status: string;
  statusChangedAt: Date;
  notes: string | null;
  appliedAt: Date;
}

interface ApplicationsTableProps {
  applications: ApplicationItem[];
  totalApplications: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function ApplicationsTable({
  applications,
  totalApplications,
  totalPages,
  currentPage,
  limit,
}: ApplicationsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "",
  );
  const [pageSize, setPageSize] = useState(limit.toString());
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationItem | null>(null);

  // Status edit states
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const applyFilters = (
    queryStr = searchVal,
    statusStr = statusFilter,
    limitStr = pageSize,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (queryStr.trim()) params.set("q", queryStr.trim());
    else params.delete("q");

    if (statusStr) params.set("status", statusStr);
    else params.delete("status");

    params.set("limit", limitStr);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/admin-dashboard/applications?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin-dashboard/applications?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const handleOpenDetails = (app: ApplicationItem) => {
    setSelectedApplication(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || "");
    setInterviewDate("");
    setVideoLink("");
    setStatusError(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;

    setStatusSubmitting(true);
    setStatusError(null);

    const result = await updateApplicationStatusAdminAction(
      selectedApplication.id,
      editStatus,
      editNotes,
      interviewDate || undefined,
      videoLink || undefined,
    );

    setStatusSubmitting(false);
    if (result.success) {
      // Update local state to reflect change in parent modal immediately
      setSelectedApplication({
        ...selectedApplication,
        status: editStatus,
        notes: editNotes || null,
      });
      // Trigger Next.js router refresh to reload server side counts
      router.refresh();
      setSelectedApplication(null); // Close modal
    } else {
      setStatusError(result.error || "Failed to update status.");
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    const confirmed = window.confirm(
      "Delete this application? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeleteSubmitting(true);
    setStatusError(null);

    const result = await deleteApplicationAdminAction(selectedApplication.id);

    setDeleteSubmitting(false);
    if (result.success) {
      router.refresh();
      setSelectedApplication(null);
    } else {
      setStatusError(result.error || "Failed to delete application.");
    }
  };

  const getExperienceLabel = (exp: string | null) => {
    if (!exp) return "Not specified";
    switch (exp) {
      case "0-1":
        return "Less than 1 year";
      case "1-3":
        return "1 – 3 years";
      case "3-5":
        return "3 – 5 years";
      case "5-10":
        return "5 – 10 years";
      case "10+":
        return "10+ years";
      default:
        return exp;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Search and filter controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-foreground self-start md:self-center">
          Applications Log
        </h2>

        <form
          onSubmit={handleSearchSubmit}
          className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search by name/job title */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidate, job, company..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                applyFilters(searchVal, e.target.value, pageSize);
              }}
              className="w-full sm:w-40 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
              <option value="">All Statuses</option>
              <option value="NEW">New / Submitted</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="APPROVED">Approved / Selected</option>
              <option value="REJECTED">Rejected / Not Selected</option>
            </select>
          </div>

          {/* Limit */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                applyFilters(searchVal, statusFilter, e.target.value);
              }}
              className="w-full sm:w-24 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shrink-0 flex items-center justify-center gap-1.5">
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
              <th className="px-6 py-4">Candidate</th>
              <th className="px-6 py-4">Applied Position</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date Applied</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-sm">
            {applications.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-foreground/50">
                  No applications recorded in the system logs.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {app.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{app.name}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {app.job.title}
                  </td>
                  <td className="px-6 py-4 text-foreground/75 flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span>{app.job.company}</span>
                  </td>
                  <td className="px-6 py-4">
                    <ApplicationStatusBadge
                      status={app.status}
                      audience="recruiter"
                    />
                  </td>
                  <td className="px-6 py-4 text-foreground/50">
                    {new Date(app.appliedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenDetails(app)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold text-foreground hover:bg-gray-50 dark:hover:bg-gray-950 transition-all cursor-pointer">
                      <Info className="w-3.5 h-3.5" />
                      Manage
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
            Showing Page{" "}
            <span className="font-semibold text-foreground">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>{" "}
            ({totalApplications} total applications)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ─── DETAILS & STATUS OVERRIDE MODAL ─── */}
      {/* ========================================== */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedApplication(null)}
          />
          <div className="relative z-10 w-full max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-150 dark:border-gray-850 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Application Details & System Override
                </h3>
                <p className="text-xs text-foreground/50 mt-0.5">
                  Applied for{" "}
                  <span className="font-semibold text-foreground/75">
                    {selectedApplication.job.title}
                  </span>{" "}
                  at{" "}
                  <span className="font-semibold text-foreground/75">
                    {selectedApplication.job.company}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6 overflow-y-auto flex-1">
              {/* Error messages */}
              {statusError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-650 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{statusError}</span>
                </div>
              )}

              {/* Grid panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col (2/3): Details */}
                <div className="md:col-span-2 space-y-5">
                  {/* Candidate contact cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        Candidate Name
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {selectedApplication.name}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5 font-mono truncate">
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        Phone
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {selectedApplication.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        Experience
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {getExperienceLabel(selectedApplication.experience)}
                      </p>
                    </div>
                  </div>

                  {/* Portfolios links */}
                  <div className="flex flex-wrap gap-3">
                    {selectedApplication.linkedin && (
                      <a
                        href={selectedApplication.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                        <Link2 className="w-3.5 h-3.5 text-blue-650" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedApplication.github && (
                      <a
                        href={selectedApplication.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors">
                        <Code2 className="w-3.5 h-3.5 text-gray-800 dark:text-gray-255" />
                        GitHub Portfolio
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <a
                      href={selectedApplication.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 bg-green-500/10 text-green-700 dark:text-green-400 dark:border-green-800/40 text-xs font-bold hover:bg-green-500/20 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      Download Resume CV
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`mailto:${selectedApplication.email}?subject=${encodeURIComponent(`Regarding your application for ${selectedApplication.job.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-500/10 text-blue-700 dark:text-blue-400 dark:border-blue-800/40 text-xs font-bold hover:bg-blue-500/20 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                      Send Manual Email
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">
                      Cover Letter Text
                    </h4>
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-250 dark:border-gray-850 rounded-xl text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedApplication.coverLetter ||
                        "No cover letter submitted for this job."}
                    </div>
                  </div>
                </div>

                {/* Right Col (1/3): Status Override Form */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-850 rounded-2xl flex flex-col gap-4">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Admin Status Control
                  </h4>

                  <form onSubmit={handleStatusSubmit} className="space-y-4">
                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5">
                        Application Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary">
                        <option value="NEW">NEW (Submitted)</option>
                        <option value="REVIEWING">REVIEWING</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="APPROVED">APPROVED (Selected)</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </div>

                    {/* Notes Textarea */}
                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5">
                        Recruiter / Admin Notes
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Add candidate notes or follow up info..."
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full p-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl text-xs font-sans text-foreground focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5">
                        Interview Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5">
                        Video Conference Link
                      </label>
                      <input
                        type="url"
                        value={videoLink}
                        onChange={(e) => setVideoLink(e.target.value)}
                        placeholder="https://meet.example.com/..."
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {editStatus === "APPROVED" &&
                      (!interviewDate || !videoLink) && (
                        <p className="text-xs text-red-600">
                          Interview date and video conference link are required
                          to approve.
                        </p>
                      )}

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={
                        statusSubmitting ||
                        (editStatus === "APPROVED" &&
                          (!interviewDate || !videoLink))
                      }
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                      {statusSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save & Override"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-850 flex flex-col sm:flex-row gap-3 justify-end shrink-0">
              <button
                type="button"
                onClick={handleDeleteApplication}
                disabled={deleteSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                {deleteSubmitting ? "Deleting..." : "Delete Application"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition-all shadow-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
