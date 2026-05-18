"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DeleteJobState = {
  success: boolean;
  error?: string;
};

export async function deleteJob(jobId: string): Promise<DeleteJobState> {
  if (!jobId) {
    return { success: false, error: "Job ID is required." };
  }

  try {
    // 1. Delete all applications related to this job to prevent foreign key constraint issues
    await prisma.application.deleteMany({
      where: { jobId },
    });

    // 2. Delete the job listing
    await prisma.job.delete({
      where: { id: jobId },
    });

    // Revalidate public and dashboard paths to refresh caching
    revalidatePath("/jobs");
    revalidatePath("/recruiter-dashboard/manage-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error deleting job:", error);
    return {
      success: false,
      error: "Failed to delete the job listing. Please try again.",
    };
  }
}
