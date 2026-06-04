import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import ApplicationsTable from "./ApplicationsTable";
import { Shield } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Job Applications Logs | Devforge Admin",
  description: "Devforge system-wide logs of software engineer job applications.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const q = params.q || "";
  const status = params.status || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.max(5, parseInt(params.limit || "10", 10));

  // Build filters
  const where: Prisma.ApplicationWhereInput = {};

  if (q.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      { email: { contains: q.trim(), mode: "insensitive" } },
      {
        job: {
          OR: [
            { title: { contains: q.trim(), mode: "insensitive" } },
            { company: { contains: q.trim(), mode: "insensitive" } }
          ]
        }
      }
    ];
  }

  if (status) {
    where.status = status;
  }

  // Count total applications matching filters
  const totalApplications = await prisma.application.count({ where });
  const totalPages = Math.ceil(totalApplications / limit);

  // Fetch paginated application records
  const applications = await prisma.application.findMany({
    where,
    orderBy: { appliedAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      job: {
        select: {
          id: true,
          title: true,
          company: true
        }
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-700 dark:text-red-300 mb-3 gap-1.5 font-sans">
          <Shield className="w-3.5 h-3.5" />
          Application Audit Log
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Applications Board</h1>
        <p className="text-foreground/60 mt-1">Audit software engineer applications across all listings, review resumes, and override workflow statuses.</p>
      </div>

      {/* Applications board grid */}
      <ApplicationsTable
        applications={applications as any}
        totalApplications={totalApplications}
        totalPages={totalPages || 1}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
