import {
  Briefcase,
  Users,
  Eye,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Building2,
  Globe2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function RecruiterDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  // Fetch employer
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true }
  });

  if (!user || !user.employer) {
    redirect("/setup/recruiter");
  }

  const employerId = user.employer.id;
  const employerName = user.employer.name;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query actual employer metrics in parallel
  const [
    activeJobsCount,
    totalApplicationsCount,
    recentApplications,
    applicationsLast30Days,
    recruiterJobs,
  ] = await Promise.all([
    prisma.job.count({ where: { employerId } }),
    prisma.application.count({ where: { job: { employerId } } }),
    prisma.application.findMany({
      where: { job: { employerId } },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
      take: 4
    }),
    prisma.application.count({
      where: {
        appliedAt: { gte: thirtyDaysAgo },
        job: { employerId },
      },
    }),
    prisma.job.findMany({
      where: { employerId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { postedAt: "desc" },
    }),
  ]);

  const jobsWithApplications = recruiterJobs.filter((job) => job._count.applications > 0).length;
  const averageApplicationsPerJob = activeJobsCount
    ? (totalApplicationsCount / activeJobsCount).toFixed(1)
    : "0";
  const topJob = [...recruiterJobs].sort(
    (a, b) => b._count.applications - a._count.applications
  )[0];

  const metrics = [
    {
      label: "Active Jobs",
      value: activeJobsCount.toString(),
      change: `${activeJobsCount} jobs currently listed`,
      trend: "neutral",
      icon: Briefcase,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
    },
    {
      label: "Applications",
      value: totalApplicationsCount.toString(),
      change: `${applicationsLast30Days} received in the last 30 days`,
      trend: "up",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    },
    {
      label: "Jobs With Applicants",
      value: jobsWithApplications.toString(),
      change: `${averageApplicationsPerJob} average applications per job`,
      trend: "neutral",
      icon: FileText,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    },
    {
      label: "Top Listing",
      value: topJob ? topJob._count.applications.toString() : "0",
      change: topJob ? topJob.title : "Post a job to start tracking",
      trend: topJob && topJob._count.applications > 0 ? "up" : "neutral",
      icon: Eye,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back, {user.name || "Recruiter"}!</h1>
          <p className="text-foreground/60 mt-1">Here is what is happening with {employerName} listings today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Applications</h2>
            <Link href="/recruiter-dashboard/manage-applications" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
              <p className="text-sm text-foreground/50 max-w-sm mx-auto">
                Applications for your job posts will appear here. Share your listings to reach more developers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-850">
              {recentApplications.map((app) => (
                <div key={app.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/25 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {app.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{app.name}</h4>
                      <p className="text-sm text-foreground/60 font-semibold">{app.job.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
                        New
                      </span>
                      <p className="text-xs text-foreground/45 mt-1">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Link 
                      href={`/recruiter-dashboard/manage-applications`}
                      className="text-foreground/45 hover:text-primary transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions / Getting Started */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {employerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{employerName}</h2>
                <p className="text-xs font-semibold text-foreground/50">Company dashboard</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Profile Summary</p>
                  <p className="text-sm text-foreground/75 leading-relaxed mt-0.5">
                    {user.employer.description || "Add a company description so candidates understand your team and engineering culture."}
                  </p>
                </div>
              </div>

              {user.employer.website && (
                <div className="flex items-start gap-3">
                  <Globe2 className="w-5 h-5 text-foreground/40 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Website</p>
                    <a
                      href={user.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline font-semibold break-all"
                    >
                      {user.employer.website.replace("https://", "").replace("http://", "")}
                    </a>
                  </div>
                </div>
              )}

              <Link
                href="/setup/recruiter"
                className="relative z-10 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Customize Company Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Quick Tasks</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-500"><CheckCircle2 className="w-5 h-5 font-bold" /></div>
                <div>
                  <p className="text-sm font-bold">Verify company email</p>
                  <p className="text-xs text-foreground/50">Completed</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">Complete company profile</p>
                  <p className="text-xs text-foreground/50">
                    {user.employer.description && user.employer.website ? "Details complete" : "Add website and description"}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className={`mt-0.5 ${activeJobsCount > 0 ? "text-emerald-500" : "text-gray-400"}`}><CheckCircle2 className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold">Post your first job</p>
                  <p className="text-xs text-foreground/50">
                    {activeJobsCount > 0 ? "Completed" : "Start receiving applications"}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
