import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users, Briefcase, FileText, FolderTree,
  Shield, ShieldAlert, ChevronRight, PlusCircle, ArrowRight,
  TrendingUp, Clock, Settings
} from "lucide-react";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";

export const metadata = {
  title: "Admin Command Center | Devforge",
  description: "Devforge system-wide analytics, metrics, and logs.",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch counts and recent entities in parallel
  const [
    totalUsers,
    totalCandidates,
    totalEmployers,
    totalAdmins,
    totalJobs,
    totalApplications,
    totalCategories,
    recentUsers,
    recentApplications
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.category.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    prisma.application.findMany({
      orderBy: { appliedAt: "desc" },
      take: 5,
      include: {
        job: true
      }
    })
  ]);

  const metrics = [
    {
      label: "Total Users",
      value: totalUsers.toString(),
      change: `${totalAdmins} Admins / ${totalEmployers} Employers / ${totalCandidates} Candidates`,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20",
    },
    {
      label: "Jobs Listed",
      value: totalJobs.toString(),
      change: "Active job listings on the board",
      icon: Briefcase,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/20",
    },
    {
      label: "Job Applications",
      value: totalApplications.toString(),
      change: "Applications submitted by developers",
      icon: FileText,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20",
    },
    {
      label: "Categories",
      value: totalCategories.toString(),
      change: "Job grouping tags in system",
      icon: FolderTree,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            System Administrator Access
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Command Center</h1>
          <p className="text-foreground/60 mt-1">Real-time statistics, job counts, categories, and system log.</p>
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
              <TrendingUp className="w-5 h-5 text-emerald-500" />
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Activity Lists */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Recent Registrations */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Recent User Registrations
              </h2>
              <Link href="/admin-dashboard/users" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                Manage Users
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentUsers.map((user) => (
                <div key={user.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/25 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-500/10 text-red-500' 
                        : user.role === 'EMPLOYER'
                        ? 'bg-purple-500/10 text-purple-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{user.name || "N/A"}</h4>
                      <p className="text-xs text-foreground/50 font-mono">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      user.role === "ADMIN"
                        ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60"
                        : user.role === "EMPLOYER"
                        ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                        : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
                    }`}>
                      {user.role === "ADMIN" ? "Admin" : user.role === "EMPLOYER" ? "Recruiter" : "Candidate"}
                    </span>
                    <span className="text-xs text-foreground/45 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Applications
              </h2>
              <Link href="/admin-dashboard/applications" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
                View all log
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentApplications.length === 0 ? (
                <div className="p-8 text-center text-foreground/50 text-sm">No applications submitted yet.</div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/25 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-foreground">{app.name}</h4>
                      <p className="text-xs text-foreground/60">Applied for <span className="font-bold text-foreground/80">{app.job.title}</span> at <span className="font-bold text-foreground/80">{app.job.company}</span></p>
                    </div>
                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <ApplicationStatusBadge status={app.status} audience="recruiter" />
                      <span className="text-xs text-foreground/45">
                        {new Date(app.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quick Tasks / Links */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Tasks</h3>
            <div className="space-y-3">
              <Link
                href="/admin-dashboard/settings"
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 border border-gray-150 dark:border-gray-800 hover:border-primary/20 rounded-xl text-sm font-semibold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-5 h-5 text-primary" />
                  <span>Create Job Category</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                href="/admin-dashboard/users"
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 border border-gray-150 dark:border-gray-800 hover:border-primary/20 rounded-xl text-sm font-semibold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Audit User Accounts</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
              <Link
                href="/admin-dashboard/settings"
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-950 hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 border border-gray-150 dark:border-gray-800 hover:border-primary/20 rounded-xl text-sm font-semibold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>System Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">System Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-foreground/50">Next.js Version</span>
                <span className="font-bold">v16.2.4</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-foreground/50">Database Engine</span>
                <span className="font-bold">PostgreSQL</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-foreground/50">ORM Adapter</span>
                <span className="font-bold">Prisma Client</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-foreground/50">Admin Account</span>
                <span className="font-bold text-red-500 font-mono text-xs">{session.email}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
