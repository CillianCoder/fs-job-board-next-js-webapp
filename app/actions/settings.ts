"use server";

import prisma from "@/lib/prisma";
import { comparePassword, hashPassword, getSession } from "@/lib/auth";

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

/**
 * Handle Password Change Server Action
 */
export async function changePasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Unauthorized access. Please log in." };
  }

  const oldPassword = (formData.get("oldPassword") as string) ?? "";
  const newPassword = (formData.get("newPassword") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  // Validation
  const fieldErrors: Record<string, string> = {};

  if (!oldPassword) {
    fieldErrors.oldPassword = "Current password is required.";
  }
  if (!newPassword) {
    fieldErrors.newPassword = "New password is required.";
  } else if (newPassword.length < 6) {
    fieldErrors.newPassword = "Password must be at least 6 characters.";
  }
  if (newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }
  if (newPassword === oldPassword) {
    fieldErrors.newPassword = "New password must be different from your current password.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  try {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found or password not set." };
    }

    // Verify old password
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return { success: false, fieldErrors: { oldPassword: "Current password is incorrect." } };
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    });

    return {
      success: true,
      message: "Your password has been changed successfully."
    };
  } catch (err) {
    console.error("Change Password Error:", err);
    return { success: false, error: "Could not change password. Please try again." };
  }
}
