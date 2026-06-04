import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Admin System Settings | Devforge",
  description: "Update admin credentials and configure system job categories.",
};

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch admin user
  const adminUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true
    }
  });

  if (!adminUser) {
    redirect("/login");
  }

  // Fetch system categories with associated job counts
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { jobs: true }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5 font-sans">
          <Shield className="w-3.5 h-3.5" />
          System Settings & Setup
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Settings Panel</h1>
        <p className="text-foreground/60 mt-1">Configure your personal profile details, change security credentials, and manage system categories.</p>
      </div>

      {/* Settings Grid */}
      <SettingsClient adminUser={adminUser} categories={categories} />
    </div>
  );
}
