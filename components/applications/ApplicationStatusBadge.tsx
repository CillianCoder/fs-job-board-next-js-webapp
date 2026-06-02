import { getApplicationStatusMeta } from "@/lib/application-status";

type ApplicationStatusBadgeProps = {
  status: string;
  audience?: "recruiter" | "candidate";
};

export default function ApplicationStatusBadge({
  status,
  audience = "recruiter",
}: ApplicationStatusBadgeProps) {
  const meta = getApplicationStatusMeta(status);
  const label = audience === "candidate" ? meta.candidateLabel : meta.recruiterLabel;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${meta.badgeClassName}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {label}
    </span>
  );
}
