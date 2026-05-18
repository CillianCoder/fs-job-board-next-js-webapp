"use client";

import Link from "next/link";
import { User, Settings, LogOut, Briefcase, FileText, LayoutDashboard } from "lucide-react";
import React from "react";
import { usePathname } from "next/navigation";

export default function RecruiterDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900/50">
      {/* Dashboard Sub-Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <nav className="flex items-center gap-6 overflow-x-auto">
            <Link
              href="/recruiter-dashboard"
              className={`flex items-center gap-2 text-sm font-medium h-14 border-b-2 transition-all ${
                pathname === "/recruiter-dashboard"
                  ? "text-primary border-primary"
                  : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </Link>
            <Link
              href="/recruiter-dashboard/manage-jobs"
              className={`flex items-center gap-2 text-sm font-medium h-14 border-b-2 transition-all ${
                pathname === "/recruiter-dashboard/manage-jobs"
                  ? "text-primary border-primary"
                  : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Manage Jobs
            </Link>
            <Link
              href="/recruiter-dashboard/manage-applications"
              className={`flex items-center gap-2 text-sm font-medium h-14 border-b-2 transition-all ${
                pathname === "/recruiter-dashboard/manage-applications"
                  ? "text-primary border-primary"
                  : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
              }`}
            >
              <FileText className="w-4 h-4" />
              Applications
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* User Profile Dropdown */}
            <div className="flex items-center group relative cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">John Recruiter</span>
                  <span className="text-xs text-foreground/60">TechCorp Inc.</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary overflow-hidden">
                  <User className="w-5 h-5" />
                </div>
              </div>

              {/* Dropdown Menu (Hover) */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 md:hidden">
                    <p className="text-sm font-semibold text-foreground">John Recruiter</p>
                    <p className="text-xs text-foreground/60">TechCorp Inc.</p>
                  </div>
                  <Link
                    href="/recruiter-dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link
                    href="#"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
