import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  User, Briefcase, FileText, Calendar, 
  Phone, Link2, Code2, ArrowRight, ExternalLink 
} from "lucide-react";

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

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950/50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back, {user.candidate.name}!</h1>
            <p className="text-foreground/60 mt-1">Here is what is happening with your job applications.</p>
          </div>
          <Link
            href="/setup/candidate"
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            Edit Developer Profile
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{applications.length}</h3>
            <p className="text-sm font-semibold text-foreground/50">Total Applications</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">
              {applications.length > 0 ? "Active" : "None"}
            </h3>
            <p className="text-sm font-semibold text-foreground/50">Job Seeking Status</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-700 dark:text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric", day: "numeric" })}
            </h3>
            <p className="text-sm font-semibold text-foreground/50">Member Since</p>
          </div>
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
                  {applications.map((app) => (
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
                      </div>

                      <div className="flex sm:flex-col items-start sm:items-end gap-2 text-left sm:text-right shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
                          Submitted
                        </span>
                        <p className="text-xs text-foreground/45 mt-1">
                          Applied {new Date(app.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
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
                      {user.candidate.experience === "0-1" ? "Less than 1 year" : 
                       user.candidate.experience === "1-3" ? "1 – 3 years" : 
                       user.candidate.experience === "3-5" ? "3 – 5 years" : 
                       user.candidate.experience === "5-10" ? "5 – 10 years" : "10+ years"}
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
    </div>
  );
}
