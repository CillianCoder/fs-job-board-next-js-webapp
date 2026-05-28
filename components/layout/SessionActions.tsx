"use client";

import { LogOut, LogIn } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

interface SessionActionsProps {
  session: {
    role: string;
  } | null;
  roleBadgeClass: string;
}

export default function SessionActions({
  session,
  roleBadgeClass,
}: SessionActionsProps) {
  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span
          className={`hidden md:inline text-xs font-bold px-2.5 py-1 rounded-full border ${roleBadgeClass}`}>
          {session.role === "ADMIN"
            ? "Admin"
            : session.role === "EMPLOYER"
              ? "Recruiter"
              : "Candidate"}
        </span>
        <form action={logoutAction} className="inline">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-bold text-foreground hover:bg-red-50 dark:hover:bg-red-950/15 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/35 transition-all cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="hidden md:flex items-center gap-1.5 text-sm font-bold text-foreground/80 hover:text-primary transition-colors">
        <LogIn className="w-4 h-4" />
        Sign In
      </Link>
      <Link
        href="/signup"
        className="px-4.5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-md shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200">
        Get Started
      </Link>
    </>
  );
}
