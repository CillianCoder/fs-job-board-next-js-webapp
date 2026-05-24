"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText } from "lucide-react";

export default function RecruiterNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 overflow-x-auto">
      <Link
        href="/recruiter-dashboard"
        className={`flex items-center gap-2 text-sm font-semibold h-14 border-b-2 transition-all ${
          pathname === "/recruiter-dashboard"
            ? "text-primary border-primary font-bold"
            : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        Overview
      </Link>
      <Link
        href="/recruiter-dashboard/manage-jobs"
        className={`flex items-center gap-2 text-sm font-semibold h-14 border-b-2 transition-all ${
          pathname === "/recruiter-dashboard/manage-jobs"
            ? "text-primary border-primary font-bold"
            : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
        }`}
      >
        <Briefcase className="w-4 h-4" />
        Manage Jobs
      </Link>
      <Link
        href="/recruiter-dashboard/manage-applications"
        className={`flex items-center gap-2 text-sm font-semibold h-14 border-b-2 transition-all ${
          pathname === "/recruiter-dashboard/manage-applications"
            ? "text-primary border-primary font-bold"
            : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
        }`}
      >
        <FileText className="w-4 h-4" />
        Applications
      </Link>
    </nav>
  );
}
