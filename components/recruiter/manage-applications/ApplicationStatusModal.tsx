"use client";

import { useEffect, useState } from "react";
import { X, Mail, Phone, ExternalLink, Download, Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import {
  updateApplicationStatus,
  updateApplicationNotes,
} from "@/app/actions/applications";

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

interface ApplicationStatusModalProps {
  application: Application | null;
  onClose: () => void;
  onStatusChange: () => void;
}

const EXPERIENCE_OPTIONS: Record<string, string> = {
  "0-1": "Less than 1 year",
  "1-3": "1 – 3 years",
  "3-5": "3 – 5 years",
  "5-10": "5 – 10 years",
  "10+": "10+ years",
};

const VALID_STATUSES = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
];

export default function ApplicationStatusModal({
  application,
  onClose,
  onStatusChange,
}: ApplicationStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(application?.notes || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (application) {
      setNotes(application.notes || "");
      setError("");
      setSuccess("");
      setLoading(false);
    }
  }, [application]);

  if (!application) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await updateApplicationStatus(
      application.id,
      newStatus,
      notes,
    );

    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "Status updated successfully.");
      setTimeout(() => {
        onStatusChange();
        onClose();
      }, 1000);
    } else {
      setError(result.error || "Failed to update status.");
    }
  };

  const handleNotesUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await updateApplicationNotes(application.id, notes);

    setLoading(false);
    if (result.success) {
      setSuccess(result.message || "Notes updated successfully.");
      setTimeout(() => {
        setSuccess("");
        onStatusChange();
      }, 1500);
    } else {
      setError(result.error || "Failed to update notes.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {application.name}
            </h2>
            <p className="text-sm text-foreground/60 mt-1">
              {application.job.title} at {application.job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-650 dark:text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-650 dark:text-emerald-300 text-sm">
              {success}
            </div>
          )}

          {/* Current Status */}
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-2">
              Current Status
            </p>
            <div className="flex items-center justify-between">
              <StatusBadge status={application.status} />
              {application.statusChangedAt && (
                <p className="text-xs text-foreground/60">
                  Updated{" "}
                  {new Date(application.statusChangedAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Contact Information
            </h3>
            <div className="space-y-2">
              <a
                href={`mailto:${application.email}`}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                <Mail className="w-4 h-4 text-foreground/60" />
                <span className="text-foreground break-all">
                  {application.email}
                </span>
                <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
              </a>
              {application.phone && (
                <a
                  href={`tel:${application.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                  <Phone className="w-4 h-4 text-foreground/60" />
                  <span className="text-foreground">{application.phone}</span>
                  <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
                </a>
              )}
            </div>
          </div>

          {/* Profile Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Professional Profiles
            </h3>
            <div className="space-y-2">
              {application.experience && (
                <p className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-sm">
                  <span className="font-semibold text-foreground/60">
                    Experience:
                  </span>
                  <span className="text-foreground">
                    {EXPERIENCE_OPTIONS[application.experience] ||
                      application.experience}
                  </span>
                </p>
              )}
              {application.linkedin && (
                <a
                  href={application.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
                  <span className="text-sm font-semibold text-foreground/60">
                    LinkedIn
                  </span>
                  <span className="text-sm text-foreground group-hover:underline truncate">
                    {application.linkedin
                      .replace("https://", "")
                      .replace("www.", "")}
                  </span>
                  <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
                </a>
              )}
              {application.github && (
                <a
                  href={application.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
                  <span className="text-sm font-semibold text-foreground/60">
                    GitHub
                  </span>
                  <span className="text-sm text-foreground group-hover:underline truncate">
                    {application.github
                      .replace("https://", "")
                      .replace("www.", "")}
                  </span>
                  <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
                </a>
              )}
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
                <Download className="w-4 h-4 text-foreground/60" />
                <span className="text-sm text-foreground group-hover:underline">
                  Download Resume
                </span>
                <ExternalLink className="w-4 h-4 ml-auto text-foreground/40" />
              </a>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Cover Letter
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>
          )}

          {/* Recruiter Notes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Recruiter Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              placeholder="Add private notes about this candidate..."
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-foreground/60">
                {notes.length}/2000 characters
              </p>
              {notes !== (application.notes || "") && (
                <button
                  onClick={handleNotesUpdate}
                  disabled={loading}
                  className="px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Notes"}
                </button>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Change Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {VALID_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading || status === application.status}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === application.status
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>
                  {loading && status === application.status ? (
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  ) : null}
                  {status === "NEW"
                    ? "New"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Applied Date */}
          <div className="text-xs text-foreground/60 pt-4 border-t border-gray-200 dark:border-gray-800">
            Applied on{" "}
            {new Date(application.appliedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
