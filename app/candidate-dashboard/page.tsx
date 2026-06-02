import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  User, Briefcase, FileText, Calendar, 
  Phone, Link2, Code2, ArrowRight, ExternalLink,
  TrendingUp, Award
} from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { getApplicationStatusMeta } from "@/lib/application-status";

export const metadata = {
  title: "Candidate Dashboard | Devforge",
  description: "View and manage your job applications and developer profile.",
};

export default async function CandidateDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") {
    redirect("/login");
  }

  // Fetch candidate profile and applications
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      candidate: true,
    }
  });

  if (!user || !user.candidate) {
    redirect("/setup/candidate");
  }

  const applications = await prisma.application.findMany({
    where: { email: user.email },
    include: {
      job: true
    },
    orderBy: {
      appliedAt: "desc"
    }
  });

  const applicationsWithUpdates = applications.filter((app) => app.status !== "NEW").length;

  // Dynamic status check or experience options helper
  const getExperienceLabel = (exp: string) => {
    switch (exp) {
      case "0-1": return "Less than 1 year";
      case "1-3": return "1 – 3 years";
      case "3-5": return "3 – 5 years";
      case "5-10": return "5 – 10 years";
      case "10+": return "10+ years";
      default: return "Not specified";
    }
  };

  const metrics = [
    {
      label: "Total Applications",
      value: applications.length.toString(),
      change: applications.length > 0 ? "Applications submitted successfully" : "No applications submitted yet",
      trend: applications.length > 0 ? "up" : "neutral",
      icon: FileText,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
    },
    {
      label: "Status Updates",
      value: applicationsWithUpdates.toString(),
      change: applicationsWithUpdates > 0 ? "Applications with recruiter updates" : "Waiting for recruiter review",
      trend: applicationsWithUpdates > 0 ? "up" : "neutral",
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
    {
      label: "Profile Strength",
      value: user.candidate.resumeUrl ? "100%" : "50%",
      change: user.candidate.resumeUrl ? "Resume uploaded & profile complete" : "Upload your resume to complete profile",
      trend: user.candidate.resumeUrl ? "up" : "neutral",
      icon: Award,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    },
    {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      change: `Registered on ${new Date(user.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`,
      trend: "neutral",
      icon: Calendar,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back, {user.candidate.name}!</h1>
          <p className="text-foreground/60 mt-1">Track your job applications and showcase your developer profile.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <TrendingUp className={`w-5 h-5 ${metric.trend === 'up' ? 'text-emerald-500' : 'text-gray-400'}`} />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm font-semibold text-foreground/50">{metric.label}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-foreground/50">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications list (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-foreground">Your Applications</h2>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-16 px-6">
                <Briefcase className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
                <p className="text-sm text-foreground/50 max-w-sm mx-auto mb-6">
                  Start applying to software engineering roles that match your stack.
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-hover transition-colors"
                >
                  Browse Jobs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-150 dark:divide-gray-800">
                {applications.map((app) => {
                  const statusMeta = getApplicationStatusMeta(app.status);

                  return (
                  <div key={app.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <Link 
                        href={`/jobs/${app.job.slug}`}
                        className="font-bold text-foreground hover:text-primary transition-colors text-lg inline-flex items-center gap-1 group"
                      >
                        {app.job.title}
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <p className="text-sm text-foreground/60 font-semibold">{app.job.company} · {app.job.location}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-foreground/75">
                          {app.job.type}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                          {app.job.salary}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/50 mt-3">{statusMeta.candidateSummary}</p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end gap-2 text-left sm:text-right shrink-0">
                      <ApplicationStatusBadge status={app.status} audience="candidate" />
                      <p className="text-xs text-foreground/45 mt-1">
                        Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      {app.statusChangedAt && app.statusChangedAt > app.appliedAt && (
                        <p className="text-xs text-foreground/45">
                          Updated {new Date(app.statusChangedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
              Developer Profile
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Full Name</h4>
                  <p className="text-sm text-foreground font-semibold mt-0.5">{user.candidate.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Phone</h4>
                  <p className="text-sm text-foreground font-semibold mt-0.5">{user.candidate.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Experience Level</h4>
                  <p className="text-sm text-foreground font-semibold mt-0.5">
                    {getExperienceLabel(user.candidate.experience || "")}
                  </p>
                </div>
              </div>

              {user.candidate.linkedin && (
                <div className="flex items-start gap-3">
                  <Link2 className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">LinkedIn</h4>
                    <a
                      href={user.candidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-semibold mt-0.5 block break-all"
                    >
                      {user.candidate.linkedin.replace("https://", "")}
                    </a>
                  </div>
                </div>
              )}

              {user.candidate.github && (
                <div className="flex items-start gap-3">
                  <Code2 className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">GitHub</h4>
                    <a
                      href={user.candidate.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-semibold mt-0.5 block break-all"
                    >
                      {user.candidate.github.replace("https://", "")}
                    </a>
                  </div>
                </div>
              )}

              {user.candidate.resumeUrl && (
                <div className="flex items-start gap-3 pt-2">
                  <FileText className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Resume / CV</h4>
                    <a
                      href={user.candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-semibold mt-0.5 inline-flex items-center gap-1.5"
                    >
                      View Resume <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
