"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export type DeleteJobState = {
  success: boolean;
  error?: string;
};

export async function deleteJob(jobId: string): Promise<DeleteJobState> {
  if (!jobId) {
    return { success: false, error: "Job ID is required." };
  }

  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "You must be logged in as a recruiter to delete a job." };
  }

  const recruiter = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true },
  });

  if (!recruiter?.employer) {
    return { success: false, error: "Complete your recruiter profile before deleting jobs." };
  }

  try {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId: recruiter.employer.id,
      },
    });

    if (!job) {
      return { success: false, error: "This job does not belong to your recruiter profile." };
    }

    await prisma.$transaction([
      prisma.application.deleteMany({
        where: { jobId: job.id },
      }),
      prisma.job.delete({
        where: { id: job.id },
      }),
    ]);

    revalidatePath(`/jobs/${job.slug}`);

    // Revalidate public and dashboard paths to refresh caching
    revalidatePath("/jobs");
    revalidatePath("/recruiter-dashboard");
    revalidatePath("/recruiter-dashboard/manage-jobs");
    revalidatePath("/recruiter-dashboard/manage-applications");

    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      error: "Failed to delete the job listing. Please try again.",
    };
  }
}
