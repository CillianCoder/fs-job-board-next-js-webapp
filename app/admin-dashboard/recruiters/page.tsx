import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import RecruitersTable from "./RecruitersTable";
import { Shield } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Employer Directory Management | Devforge Admin",
  description: "Devforge system-wide recruiter directory and company profiles.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminRecruitersPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const q = params.q || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.max(5, parseInt(params.limit || "10", 10));

  // Build filter conditions
  const where: Prisma.EmployerWhereInput = {};

  if (q.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      {
        user: {
          OR: [
            { name: { contains: q.trim(), mode: "insensitive" } },
            { email: { contains: q.trim(), mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  // Get total count
  const totalRecruiters = await prisma.employer.count({ where });
  const totalPages = Math.ceil(totalRecruiters / limit);

  // Fetch paginated employers with associated user details and posted jobs feed
  const recruiters = await prisma.employer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      jobs: {
        select: {
          id: true,
          title: true,
          location: true,
          type: true,
          salary: true,
          postedAt: true,
        },
        orderBy: {
          postedAt: "desc"
        }
      },
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5 font-sans">
          <Shield className="w-3.5 h-3.5" />
          Employer Directory Administration
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Recruiters Management</h1>
        <p className="text-foreground/60 mt-1">Audit company profiles, websites, logos, and check all job posts published on the board.</p>
      </div>

      {/* Recruiters Interactive Table */}
      <RecruitersTable
        recruiters={recruiters}
        totalRecruiters={totalRecruiters}
        totalPages={totalPages || 1}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
