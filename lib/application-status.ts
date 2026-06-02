export const APPLICATION_STATUSES = [
  "NEW",
  "REVIEWING",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

type ApplicationStatusMeta = {
  recruiterLabel: string;
  candidateLabel: string;
  candidateSummary: string;
  badgeClassName: string;
};

export const APPLICATION_STATUS_META: Record<ApplicationStatus, ApplicationStatusMeta> = {
  NEW: {
    recruiterLabel: "New",
    candidateLabel: "Submitted",
    candidateSummary: "Your application was received.",
    badgeClassName:
      "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
  },
  REVIEWING: {
    recruiterLabel: "Reviewing",
    candidateLabel: "Under review",
    candidateSummary: "The hiring team is reviewing your application.",
    badgeClassName:
      "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
  },
  SHORTLISTED: {
    recruiterLabel: "Shortlisted",
    candidateLabel: "Shortlisted",
    candidateSummary: "You have been shortlisted for the next stage.",
    badgeClassName:
      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
  },
  APPROVED: {
    recruiterLabel: "Approved",
    candidateLabel: "Selected",
    candidateSummary: "The recruiter marked this application as selected.",
    badgeClassName:
      "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  REJECTED: {
    recruiterLabel: "Rejected",
    candidateLabel: "Not selected",
    candidateSummary: "This application is not moving forward.",
    badgeClassName:
      "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
  },
};

export function isApplicationStatus(status: string): status is ApplicationStatus {
  return APPLICATION_STATUSES.includes(status as ApplicationStatus);
}

export function getApplicationStatusMeta(status: string) {
  return APPLICATION_STATUS_META[isApplicationStatus(status) ? status : "NEW"];
}
