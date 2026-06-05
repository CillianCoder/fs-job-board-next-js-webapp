"use client";

import { Mail, Download, Eye } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface Application {
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

interface ApplicationsTableProps {
  applications: Application[];
  onViewProfile: (application: Application) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function ApplicationsTable({
  applications,
  onViewProfile,
  selectedIds,
  onSelectionChange,
}: ApplicationsTableProps) {
  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectionChange(applications.map((app) => app.id));
    } else {
      onSelectionChange([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60 text-lg">No applications found.</p>
        <p className="text-foreground/40 mt-1">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === applications.length &&
                    applications.length > 0
                  }
                  onChange={toggleSelectAll}
                  aria-label="Select all applications"
                  className="w-4 h-4 rounded cursor-pointer"
                />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80">
                Applicant
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80">
                Job
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground/80">
                Applied
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground/80">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {applications.map((application) => (
              <tr
                key={application.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(application.id)}
                    onChange={() => toggleSelectOne(application.id)}
                    aria-label={`Select application from ${application.name}`}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {application.name}
                    </p>
                    <p className="text-sm text-foreground/60">
                      {application.email}
                    </p>
                    {application.phone && (
                      <p className="text-sm text-foreground/60">
                        {application.phone}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {application.job.title}
                    </p>
                    <p className="text-xs text-foreground/60">
                      {application.job.company}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={application.status} />
                </td>
                <td className="px-6 py-4 text-sm text-foreground/60">
                  {new Date(application.appliedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewProfile(application)}
                      aria-label={`View profile for ${application.name}`}
                      className="p-2 text-foreground/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="View Profile">
                      <Eye className="w-4 h-4" />
                    </button>
                    <a
                      href={`mailto:${application.email}?subject=${encodeURIComponent(`Follow-up on your application for ${application.job.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Email ${application.email}`}
                      className="p-2 text-foreground/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Send Email">
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Download resume for ${application.name}`}
                      className="p-2 text-foreground/60 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      title="Download Resume">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-800">
        {applications.map((application) => (
          <div key={application.id} className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(application.id)}
                onChange={() => toggleSelectOne(application.id)}
                aria-label={`Select application from ${application.name}`}
                className="w-4 h-4 rounded cursor-pointer mt-1"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {application.name}
                </p>
                <p className="text-sm text-foreground/60 truncate">
                  {application.email}
                </p>
                {application.phone && (
                  <p className="text-sm text-foreground/60">
                    {application.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-foreground/60">Job</p>
                <p className="font-semibold text-foreground truncate">
                  {application.job.title}
                </p>
              </div>
              <div>
                <p className="text-foreground/60">Status</p>
                <div className="mt-1">
                  <StatusBadge status={application.status} />
                </div>
              </div>
            </div>

            <div className="text-xs text-foreground/60">
              Applied{" "}
              {new Date(application.appliedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => onViewProfile(application)}
                className="flex-1 px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition-colors">
                View Profile
              </button>
              <a
                href={`mailto:${application.email}?subject=${encodeURIComponent(`Follow-up on your application for ${application.job.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 dark:bg-gray-800 text-foreground/60 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 dark:bg-gray-800 text-foreground/60 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
