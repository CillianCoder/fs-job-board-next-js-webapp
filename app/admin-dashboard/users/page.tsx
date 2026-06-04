import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";
import { Shield } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Auditing User Accounts | Devforge Admin",
  description: "Devforge system-wide user directories and account setups.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const q = params.q || "";
  const role = params.role || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.max(5, parseInt(params.limit || "10", 10));

  // Build filter conditions
  const where: Prisma.UserWhereInput = {};

  if (q.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { email: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  if (role && ["ADMIN", "EMPLOYER", "CANDIDATE"].includes(role)) {
    where.role = role;
  }

  // Get total count for pagination
  const totalUsers = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalUsers / limit);

  // Fetch paginated user records
  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5 font-sans">
          <Shield className="w-3.5 h-3.5" />
          User Directory Administration
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">User Management</h1>
        <p className="text-foreground/60 mt-1">Audit profiles, modify roles, and generate secure temporary passwords on behalf of users.</p>
      </div>

      {/* Users Interactive Table */}
      <UsersTable
        users={users}
        currentUser={session}
        totalUsers={totalUsers}
        totalPages={totalPages || 1}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
