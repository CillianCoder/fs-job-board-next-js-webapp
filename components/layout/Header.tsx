import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { User, LogOut, LayoutDashboard, Shield, LogIn } from "lucide-react";

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
          <Link href="/jobs" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
            Find Jobs
          </Link>
          {showDashboard && (
            <Link href={dashboardPath} className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
              {session?.role === "ADMIN" ? <Shield className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              {dashboardLabel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {session ? (
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-xs font-bold text-foreground/60 bg-gray-100 dark:bg-gray-850 px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-800">
                {session.role === "ADMIN" ? "Admin" : session.role === "EMPLOYER" ? "Recruiter" : "Candidate"}
              </span>
              <form action={logoutAction} className="inline">
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-850 text-sm font-bold text-foreground hover:bg-red-50 dark:hover:bg-red-950/15 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/35 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link 
                href="/login" 
                className="hidden md:flex items-center gap-1.5 text-sm font-bold text-foreground/80 hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-4.5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-md shadow-primary/10 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
