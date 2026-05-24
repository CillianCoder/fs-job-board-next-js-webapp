import {
  Briefcase,
  Users,
  Eye,
  Clock,
  ChevronRight,
  Plus,
  TrendingUp,
  CheckCircle2,
  FileText
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

  // Query actual metrics in parallel
  const [activeJobsCount, totalApplicationsCount, recentApplications] = await Promise.all([
    prisma.job.count({ where: { employerId } }),
    prisma.application.count({ where: { job: { employerId } } }),
    prisma.application.findMany({
      where: { job: { employerId } },
      include: { job: true },
      orderBy: { appliedAt: "desc" },
      take: 4
    })
  ]);

  // Dummy metrics that aren't stored in DB (retained for premium dashboard display)
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
      label: "Total Applications",
      value: totalApplicationsCount.toString(),
      change: `${totalApplicationsCount} candidate applications`,
      trend: "up",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    },
    {
      label: "Interviews Scheduled",
      value: "0",
      change: "Setup interviews via applicants",
      trend: "neutral",
      icon: Clock,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 dark:bg-orange-500/20",
    },
    {
      label: "Employer Views",
      value: "148",
      change: "+12% views this week",
      trend: "up",
      icon: Eye,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome back, {user.name || "Recruiter"}!</h1>
          <p className="text-foreground/60 mt-1">Here is what is happening with {employerName} listings today.</p>
        </div>
        <Link
          href="/recruiter-dashboard/manage-jobs/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Post a New Job
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
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
          <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-650 border border-blue-100 dark:border-blue-900/30">
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
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Boost Your Reach</h2>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Upgrade your company profile to premium to appear higher in search results and attract top-tier engineering talent.
              </p>
              <button className="bg-white text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors w-full shadow-sm cursor-pointer">
                Upgrade to Premium
              </button>
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
                  <p className="text-xs text-foreground/50">Details complete</p>
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
