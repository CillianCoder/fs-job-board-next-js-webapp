"use server";

import prisma from "@/lib/prisma";
import { getSession, hashPassword, comparePassword, setSessionCookie } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { isApplicationStatus } from "@/lib/application-status";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
  data?: any;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper to check if current user is admin
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Administrator access required.");
  }
  return session;
}

// Generate secure random password
function generateSecurePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()";
  let pwd = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

// Slugify string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/**
 * Update user details (name, email, role)
 */
export async function updateUserAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const adminSession = await requireAdmin();
    const userId = formData.get("userId") as string;
    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const role = (formData.get("role") as string) ?? "";

    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    const fieldErrors: Record<string, string> = {};
    if (!name.trim()) fieldErrors.name = "Name is required.";
    if (!email.trim() || !EMAIL_RE.test(email)) fieldErrors.email = "Valid email is required.";
    if (role !== "ADMIN" && role !== "EMPLOYER" && role !== "CANDIDATE") {
      fieldErrors.role = "Invalid role selected.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors };
    }

    // Safety check: prevent changing own role
    if (userId === adminSession.userId && role !== "ADMIN") {
      return { success: false, error: "You cannot change your own Administrator role." };
    }

    // Check if email already in use
    const existing = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        id: { not: userId }
      }
    });
    if (existing) {
      return { success: false, fieldErrors: { email: "Email is already in use by another user." } };
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role
      }
    });

    // Handle cascading profile setup
    if (role === "CANDIDATE") {
      await prisma.candidateProfile.upsert({
        where: { userId },
        update: { name: name.trim() },
        create: {
          userId,
          name: name.trim()
        }
      });
    } else if (role === "EMPLOYER") {
      await prisma.employer.upsert({
        where: { userId },
        update: { name: name.trim() },
        create: {
          userId,
          name: name.trim()
        }
      });
    }

    revalidatePath("/admin-dashboard/users");
    revalidatePath("/admin-dashboard/recruiters");
    revalidatePath("/admin-dashboard/candidates");
    return { success: true, message: `User "${name}" updated successfully.` };
  } catch (err: any) {
    console.error("updateUserAction Error:", err);
    return { success: false, error: err.message || "Failed to update user." };
  }
}

/**
 * Reset user password and return plain text generated password
 */
export async function resetUserPasswordAction(userId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const tempPassword = generateSecurePassword();
    const hashedPassword = await hashPassword(tempPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Password reset completed successfully.",
      data: {
        tempPassword,
        name: user.name || "User",
        email: user.email
      }
    };
  } catch (err: any) {
    console.error("resetUserPasswordAction Error:", err);
    return { success: false, error: err.message || "Failed to reset password." };
  }
}

/**
 * Update application status (Admin override)
 */
export async function updateApplicationStatusAdminAction(
  applicationId: string,
  newStatus: string,
  notes?: string
): Promise<ActionState> {
  try {
    await requireAdmin();

    if (!isApplicationStatus(newStatus)) {
      return { success: false, error: "Invalid status." };
    }

    if (notes && notes.length > 2000) {
      return { success: false, error: "Notes cannot exceed 2000 characters." };
    }

    const app = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!app) {
      return { success: false, error: "Application not found." };
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        statusChangedAt: new Date(),
        notes: notes || app.notes
      }
    });

    revalidatePath("/admin-dashboard/applications");
    revalidatePath("/recruiter-dashboard/manage-applications");
    revalidatePath("/candidate-dashboard");
    return { success: true, message: "Application status updated successfully by Admin." };
  } catch (err: any) {
    console.error("updateApplicationStatusAdminAction Error:", err);
    return { success: false, error: err.message || "Failed to update application status." };
  }
}

/**
 * Create a new Job Category
 */
export async function createCategoryAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const name = (formData.get("name") as string) ?? "";
    const description = (formData.get("description") as string) ?? "";

    if (!name.trim()) {
      return { success: false, fieldErrors: { name: "Category name is required." } };
    }

    const slug = slugify(name);

    // Check if slug/name already exists
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name.trim(), mode: "insensitive" } },
          { slug: slug }
        ]
      }
    });

    if (existing) {
      return { success: false, fieldErrors: { name: "Category name or slug already exists." } };
    }

    await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description.trim() || null
      }
    });

    revalidatePath("/admin-dashboard/settings");
    revalidatePath("/admin-dashboard");
    revalidatePath("/jobs");
    return { success: true, message: `Category "${name}" created successfully.` };
  } catch (err: any) {
    console.error("createCategoryAction Error:", err);
    return { success: false, error: err.message || "Failed to create category." };
  }
}

/**
 * Delete a Job Category
 */
export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  try {
    await requireAdmin();
    if (!categoryId) {
      return { success: false, error: "Category ID is required." };
    }

    // Prisma relation handles setNull automatically since categoryId is optional in Job schema.
    await prisma.category.delete({
      where: { id: categoryId }
    });

    revalidatePath("/admin-dashboard/settings");
    revalidatePath("/admin-dashboard");
    revalidatePath("/jobs");
    return { success: true, message: "Category deleted successfully." };
  } catch (err: any) {
    console.error("deleteCategoryAction Error:", err);
    return { success: false, error: err.message || "Failed to delete category." };
  }
}

/**
 * Update Admin Profile details (Name & Email)
 */
export async function updateAdminProfileAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const adminSession = await requireAdmin();
    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";

    const fieldErrors: Record<string, string> = {};
    if (!name.trim()) fieldErrors.name = "Name is required.";
    if (!email.trim() || !EMAIL_RE.test(email)) fieldErrors.email = "Valid email is required.";

    if (Object.keys(fieldErrors).length > 0) {
      return { success: false, fieldErrors };
    }

    // Check if email already in use
    const existing = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        id: { not: adminSession.userId }
      }
    });
    if (existing) {
      return { success: false, fieldErrors: { email: "Email is already in use by another account." } };
    }

    await prisma.user.update({
      where: { id: adminSession.userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim()
      }
    });

    // Update the active session cookie
    await setSessionCookie({
      ...adminSession,
      email: email.toLowerCase().trim()
    });

    revalidatePath("/admin-dashboard/settings");
    return { success: true, message: "Profile details updated successfully." };
  } catch (err: any) {
    console.error("updateAdminProfileAction Error:", err);
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

/**
 * Delete a user account and clean up associated records
 */
export async function deleteUserAction(userId: string): Promise<ActionState> {
  try {
    const adminSession = await requireAdmin();
    if (!userId) {
      return { success: false, error: "User ID is required." };
    }

    if (userId === adminSession.userId) {
      return { success: false, error: "You cannot delete your own Administrator account." };
    }

    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employer: true,
        candidate: true
      }
    });

    if (!userToDelete) {
      return { success: false, error: "User not found." };
    }

    // Perform cleanup and deletion inside a transaction
    await prisma.$transaction(async (tx) => {
      // 1. If recruiter, delete their jobs (which cascade deletes applications)
      if (userToDelete.employer) {
        await tx.job.deleteMany({
          where: { employerId: userToDelete.employer.id }
        });
        
        await tx.employer.delete({
          where: { id: userToDelete.employer.id }
        });
      }

      // 2. If candidate, delete candidate profile
      if (userToDelete.candidate) {
        await tx.candidateProfile.delete({
          where: { id: userToDelete.candidate.id }
        });
      }

      // 3. Delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    revalidatePath("/admin-dashboard");
    revalidatePath("/admin-dashboard/users");
    revalidatePath("/admin-dashboard/recruiters");
    revalidatePath("/admin-dashboard/candidates");
    revalidatePath("/admin-dashboard/applications");
    revalidatePath("/jobs");
    
    return { 
      success: true, 
      message: `User "${userToDelete.name || userToDelete.email}" and all associated data have been permanently deleted.` 
    };
  } catch (err: any) {
    console.error("deleteUserAction Error:", err);
    return { success: false, error: err.message || "Failed to delete user." };
  }
}
