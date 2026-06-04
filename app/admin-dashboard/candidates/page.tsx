import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CandidatesTable from "./CandidatesTable";
import { Shield } from "lucide-react";
import type { Prisma } from "@prisma/client";

export const metadata = {
  title: "Candidate Profiles Directory | Devforge Admin",
  description: "Devforge system-wide software engineer directories and resumes.",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    experience?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminCandidatesPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const params = await searchParams;
  const q = params.q || "";
  const experience = params.experience || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = Math.max(5, parseInt(params.limit || "10", 10));

  // Build filter conditions
  const where: Prisma.CandidateProfileWhereInput = {};

  if (q.trim()) {
    where.OR = [
      { name: { contains: q.trim(), mode: "insensitive" } },
      {
        user: {
          email: { contains: q.trim(), mode: "insensitive" }
        }
      }
    ];
  }

  if (experience) {
    where.experience = experience;
  }

  // Get total count
  const totalCandidates = await prisma.candidateProfile.count({ where });
  const totalPages = Math.ceil(totalCandidates / limit);

  // Fetch paginated candidate records with linked user account context
  const candidates = await prisma.candidateProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: {
        select: {
          email: true
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
          Candidate Profile Administration
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidates Management</h1>
        <p className="text-foreground/60 mt-1">Audit developer resumes, years of experience, LinkedIn/GitHub profiles, and cover letters.</p>
      </div>

      {/* Candidates Interactive Table */}
      <CandidatesTable
        candidates={candidates}
        totalCandidates={totalCandidates}
        totalPages={totalPages || 1}
        currentPage={page}
        limit={limit}
      />
    </div>
  );
}
