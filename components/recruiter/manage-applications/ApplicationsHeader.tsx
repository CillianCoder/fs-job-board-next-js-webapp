"use client";

import { BarChart3, Users, CheckCircle2, XCircle, Star } from "lucide-react";

interface ApplicationsHeaderProps {
  total: number;
  statusCounts: Record<string, number>;
}

export default function ApplicationsHeader({ total, statusCounts }: ApplicationsHeaderProps) {
  const stats = [
    {
      label: "Total Applications",
      value: total,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "New",
      value: statusCounts.NEW || 0,
      icon: BarChart3,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Approved",
      value: statusCounts.APPROVED || 0,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Rejected",
      value: statusCounts.REJECTED || 0,
      icon: XCircle,
      color: "bg-red-500/10 text-red-600 dark:text-red-400",
    },
    {
      label: "Shortlisted",
      value: statusCounts.SHORTLISTED || 0,
      icon: Star,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Manage Applications</h1>
        <p className="text-foreground/60 mt-1">Review and manage all applications for your jobs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground/60">{stat.label}</p>
                <p className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
