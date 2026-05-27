import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getSession } from "@/lib/auth";
import { LayoutDashboard, Shield } from "lucide-react";
import SessionActions from "@/components/layout/SessionActions";

export default async function Header() {
  const session = await getSession();

  let dashboardPath = "/";
  let dashboardLabel = "Dashboard";
  let showDashboard = false;

  if (session) {
    showDashboard = true;
    if (session.role === "ADMIN") {
      dashboardPath = "/admin-dashboard";
      dashboardLabel = "Admin Panel";
    } else if (session.role === "EMPLOYER") {
      dashboardPath = "/recruiter-dashboard";
      dashboardLabel = "Dashboard";
    } else {
      dashboardPath = "/candidate-dashboard";
      dashboardLabel = "Dashboard";
    }
  }

  const roleBadgeClass =
    session?.role === "ADMIN"
      ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60"
      : session?.role === "EMPLOYER"
        ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
        : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/85 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl shadow-md shadow-primary/20">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">
            Dev<span className="text-primary">forge</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <Link
            href="/jobs"
            className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
            Find Jobs
          </Link>
          {showDashboard && (
            <Link
              href={dashboardPath}
              className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
              {session?.role === "ADMIN" ? (
                <Shield className="w-4 h-4" />
              ) : (
                <LayoutDashboard className="w-4 h-4" />
              )}
              {dashboardLabel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SessionActions session={session} roleBadgeClass={roleBadgeClass} />
        </div>
      </div>
    </header>
  );
}
