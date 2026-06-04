import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import React from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { logoutAction } from "@/app/actions/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch admin details
  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) {
    redirect("/login");
  }

  const adminName = user.name || "Administrator";
  const initials = adminName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950/50">
      {/* Dashboard Sub-Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <AdminNav />

          <div className="flex items-center gap-4">
            {/* User Profile Dropdown */}
            <div className="flex items-center group relative cursor-pointer py-2">
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">{adminName}</span>
                  <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Admin</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 overflow-hidden font-bold">
                  {initials}
                </div>
              </div>

              {/* Dropdown Menu (Hover) */}
              <div className="absolute right-0 top-full w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 md:hidden">
                    <p className="text-sm font-bold text-foreground">{adminName}</p>
                    <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Admin</p>
                  </div>
                  <Link
                    href="/admin-dashboard/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foreground transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Settings
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </form>
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
