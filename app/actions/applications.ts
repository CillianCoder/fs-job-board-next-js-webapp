"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { isApplicationStatus } from "@/lib/application-status";

export type ApplicationState = {
  success: boolean;
  error?: string;
  message?: string;
};

async function getRecruiterEmployerId() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    return null;
  }

  const recruiter = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { employer: { select: { id: true } } },
  });

  return recruiter?.employer?.id ?? null;
}

/**
 * Update application status with validation
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: string,
  notes?: string
): Promise<ApplicationState> {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return { success: false, error: "Unauthorized access." };
  }

  // Validate status
  if (!isApplicationStatus(newStatus)) {
    return { success: false, error: "Invalid status." };
  }

  // Validate notes length if provided
  if (notes && notes.length > 2000) {
    return { success: false, error: "Notes cannot exceed 2000 characters." };
  }

  try {
    // Get application with job details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    // Verify recruiter owns this job
    if (application.job.employerId !== employerId) {
      return { success: false, error: "Unauthorized access." };
    }

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        statusChangedAt: new Date(),
        notes: notes || application.notes
      }
    });

    revalidatePath("/recruiter-dashboard");
    revalidatePath("/recruiter-dashboard/manage-applications");
    revalidatePath("/candidate-dashboard");

    return { success: true, message: `Application status updated to ${newStatus}.` };
  } catch (err) {
    console.error("Update Application Status Error:", err);
    return { success: false, error: "Failed to update application status." };
  }
}

/**
 * Bulk update applications status
 */
export async function bulkUpdateApplicationStatus(
  applicationIds: string[],
  newStatus: string
): Promise<ApplicationState> {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return { success: false, error: "Unauthorized access." };
  }

  if (!isApplicationStatus(newStatus)) {
    return { success: false, error: "Invalid status." };
  }

  if (!applicationIds || applicationIds.length === 0) {
    return { success: false, error: "No applications selected." };
  }

  try {
    // Get all applications with job details to verify ownership
    const applications = await prisma.application.findMany({
      where: { id: { in: applicationIds } },
      include: { job: true }
    });

    if (applications.length !== applicationIds.length) {
      return { success: false, error: "Some applications not found." };
    }

    // Verify all applications belong to recruiter's jobs
    const unauthorized = applications.some((app) => app.job.employerId !== employerId);
    if (unauthorized) {
      return { success: false, error: "Unauthorized access to some applications." };
    }

    // Bulk update
    await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: {
        status: newStatus,
        statusChangedAt: new Date()
      }
    });

    revalidatePath("/recruiter-dashboard");
    revalidatePath("/recruiter-dashboard/manage-applications");
    revalidatePath("/candidate-dashboard");

    return {
      success: true,
      message: `Updated ${applicationIds.length} application(s) to ${newStatus}.`
    };
  } catch (err) {
    console.error("Bulk Update Applications Error:", err);
    return { success: false, error: "Failed to bulk update applications." };
  }
}

/**
 * Update application notes
 */
export async function updateApplicationNotes(
  applicationId: string,
  notes: string
): Promise<ApplicationState> {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return { success: false, error: "Unauthorized access." };
  }

  if (notes.length > 2000) {
    return { success: false, error: "Notes cannot exceed 2000 characters." };
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return { success: false, error: "Application not found." };
    }

    if (application.job.employerId !== employerId) {
      return { success: false, error: "Unauthorized access." };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { notes: notes || null }
    });

    revalidatePath("/recruiter-dashboard");
    revalidatePath("/recruiter-dashboard/manage-applications");
    revalidatePath("/candidate-dashboard");

    return { success: true, message: "Notes updated successfully." };
  } catch (err) {
    console.error("Update Application Notes Error:", err);
    return { success: false, error: "Failed to update notes." };
  }
}

/**
 * Get application with all details
 */
export async function getApplicationWithJob(applicationId: string) {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return null;
  }

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true }
    });

    if (!application) {
      return null;
    }

    // Verify ownership
    if (application.job.employerId !== employerId) {
      return null;
    }

    return application;
  } catch (err) {
    console.error("Get Application Error:", err);
    return null;
  }
}

/**
 * Get recruiter's applications with filtering and pagination
 */
export async function getRecruiterApplications(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    status?: string;
    jobId?: string;
    searchQuery?: string;
    dateFrom?: Date;
    dateTo?: Date;
  },
  sortBy: "date" | "status" | "name" = "date"
) {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return null;
  }

  try {
    // Build filter conditions
    const where: Prisma.ApplicationWhereInput = {
      job: {
        employerId
      }
    };

    if (filters?.status && isApplicationStatus(filters.status)) {
      where.status = filters.status;
    }

    if (filters?.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters?.searchQuery) {
      where.OR = [
        { name: { contains: filters.searchQuery, mode: "insensitive" } },
        { email: { contains: filters.searchQuery, mode: "insensitive" } }
      ];
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.appliedAt = {};
      if (filters.dateFrom) {
        where.appliedAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.appliedAt.lte = filters.dateTo;
      }
    }

    // Determine sort order
    let orderBy: Prisma.ApplicationOrderByWithRelationInput = { appliedAt: "desc" };
    if (sortBy === "status") {
      orderBy = { status: "asc" };
    } else if (sortBy === "name") {
      orderBy = { name: "asc" };
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Get paginated results
    const applications = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Get status counts
    const statusCounts = await prisma.application.groupBy({
      by: ["status"],
      where: { job: { employerId } },
      _count: {
        _all: true
      }
    });

    return {
      applications,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      statusCounts: statusCounts.reduce(
        (acc, sc) => {
          acc[sc.status] = sc._count._all;
          return acc;
        },
        {} as Record<string, number>
      )
    };
  } catch (err) {
    console.error("Get Recruiter Applications Error:", err);
    return null;
  }
}

/**
 * Get recruiter's jobs for filter dropdown
 */
export async function getRecruiterJobs() {
  const employerId = await getRecruiterEmployerId();
  if (!employerId) {
    return null;
  }

  try {
    const jobs = await prisma.job.findMany({
      where: { employerId },
      select: { id: true, title: true },
      orderBy: { postedAt: "desc" }
    });

    return jobs;
  } catch (err) {
    console.error("Get Recruiter Jobs Error:", err);
    return null;
  }
}
