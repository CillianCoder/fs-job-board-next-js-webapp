import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Users, Briefcase, FileText,
  Shield, ShieldAlert
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | Devforge",
  description: "Devforge system-wide analytics and user management.",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch counts in parallel
  const [
    totalUsers,
    totalCandidates,
    totalEmployers,
    totalAdmins,
    totalJobs,
    totalApplications,
    usersList
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
  ]);

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950/50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            System Administrator Access
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Command Center</h1>
          <p className="text-foreground/60 mt-1">Real-time statistics, job counts, and user directory.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground/40">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{totalUsers}</h3>
            <p className="text-sm font-semibold text-foreground/50">Registered Users</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-700 dark:text-purple-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground/40">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{totalJobs}</h3>
            <p className="text-sm font-semibold text-foreground/50">Jobs Posted</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground/40">Submitted</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{totalApplications}</h3>
            <p className="text-sm font-semibold text-foreground/50">Applications Sent</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground/40">Roles</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-foreground">{totalAdmins}A</h3>
              <span className="text-xs text-foreground/45">/ {totalEmployers}E / {totalCandidates}C</span>
            </div>
            <p className="text-sm font-semibold text-foreground/50 mt-1">Admin / Employer / Candidate</p>
          </div>
        </div>

        {/* User Directory Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">User Directory</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs font-bold text-foreground/60 uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 text-sm">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">{user.name || "N/A"}</td>
                    <td className="px-6 py-4 text-foreground/75 font-mono">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        user.role === "ADMIN" 
                          ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60"
                          : user.role === "EMPLOYER"
                          ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                          : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
                      }`}>
                        {user.role === "ADMIN" ? "Admin" : user.role === "EMPLOYER" ? "Recruiter" : "Candidate"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/50">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { 
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
