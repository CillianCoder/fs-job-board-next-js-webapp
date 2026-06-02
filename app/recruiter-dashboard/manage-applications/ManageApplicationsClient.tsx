"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import ApplicationsHeader from "@/components/recruiter/manage-applications/ApplicationsHeader";
import ApplicationsFilter from "@/components/recruiter/manage-applications/ApplicationsFilter";
import ApplicationsTable from "@/components/recruiter/manage-applications/ApplicationsTable";
import ApplicationStatusModal from "@/components/recruiter/manage-applications/ApplicationStatusModal";
import Pagination from "@/components/recruiter/manage-applications/Pagination";
import { bulkUpdateApplicationStatus } from "@/app/actions/applications";

export interface Job {
  id: string;
  title: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  resumeUrl: string;
  linkedin?: string | null;
  github?: string | null;
  experience?: string | null;
  coverLetter?: string | null;
  status: string;
  statusChangedAt?: Date | null;
  notes?: string | null;
  appliedAt: Date;
  job: {
    id: string;
    title: string;
    company: string;
  };
}

interface ManageApplicationsClientProps {
  initialApplications: Application[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  statusCounts: Record<string, number>;
  jobs: Job[];
}

export default function ManageApplicationsClient({
  initialApplications,
  total,
  page,
  pageSize,
  totalPages,
  statusCounts,
  jobs,
}: ManageApplicationsClientProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionMessage, setBulkActionMessage] = useState("");

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);
    setBulkActionMessage("");

    const result = await bulkUpdateApplicationStatus(selectedIds, newStatus);

    setBulkActionLoading(false);
    if (result.success) {
      setBulkActionMessage(result.message || "Applications updated successfully.");
      setSelectedIds([]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setBulkActionMessage(result.error || "Failed to update applications.");
    }
  };

  const handleApplicationRefresh = () => {
    window.location.reload();
  };

  if (initialApplications.length === 0 && total === 0) {
    return (
      <div>
        <ApplicationsHeader total={0} statusCounts={statusCounts} />
        <ApplicationsFilter jobs={jobs} />
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-16 px-6 text-center">
          <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-foreground/50 max-w-sm mx-auto">
            Once candidates apply to your job listings, they will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ApplicationsHeader total={total} statusCounts={statusCounts} />

      <ApplicationsFilter jobs={jobs} />

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              {selectedIds.length} application{selectedIds.length !== 1 ? "s" : ""} selected
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["NEW", "REVIEWING", "SHORTLISTED", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => handleBulkStatusChange(status)}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "NEW" ? "Mark New" : `Mark ${status}`}
              </button>
            ))}
            <button
              onClick={() => setSelectedIds([])}
              disabled={bulkActionLoading}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-foreground text-sm font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {bulkActionMessage && (
        <div
          className={`p-4 rounded-lg ${
            bulkActionMessage.includes("Failed")
              ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
              : "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {bulkActionMessage}
        </div>
      )}

      <ApplicationsTable
        applications={initialApplications}
        onViewProfile={setSelectedApplication}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
      />

      <ApplicationStatusModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onStatusChange={handleApplicationRefresh}
      />
    </div>
  );
}
