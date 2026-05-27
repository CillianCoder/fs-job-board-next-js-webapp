"use server";

import prisma from "@/lib/prisma";
import { comparePassword, hashPassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";
import { sendResetPasswordEmail } from "@/lib/email";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { SignJWT, jwtVerify } from "jose";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const RESET_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'devforge-super-secret-key-change-me-in-production'
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export type ActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
};

/**
 * Handle Login Server Action
 */
export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  // 1. Validation
  const fieldErrors: Record<string, string> = {};
  if (!email.trim()) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email)) {
    fieldErrors.email = "Invalid email format.";
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  // 2. Authenticate
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        employer: true,
        candidate: true
      }
    });

    if (!user || !user.password) {
      return { success: false, error: "Invalid email or password." };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Invalid email or password." };
    }

    // 3. Check if profile setup is complete
    let setupComplete = false;
    if (user.role === "ADMIN") {
      setupComplete = true;
    } else if (user.role === "EMPLOYER") {
      setupComplete = !!user.employer && !!user.employer.name;
    } else if (user.role === "CANDIDATE") {
      setupComplete = !!user.candidate && !!user.candidate.name;
    }

    // 4. Set Session Cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      setupComplete
    });

    // 5. Redirect on success based on role and setup status
    if (!setupComplete) {
      if (user.role === "CANDIDATE") {
        redirect("/setup/candidate");
      } else {
        redirect("/setup/recruiter");
      }
    } else {
      if (user.role === "ADMIN") {
        redirect("/admin-dashboard");
      } else if (user.role === "EMPLOYER") {
        redirect("/recruiter-dashboard");
      } else {
        redirect("/candidate-dashboard");
      }
    }
  } catch (err: any) {
    // Standard Next.js redirect mechanism throws a specific error, which we must propagate.
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Login Error:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Handle Signup Server Action
 */
export async function signupAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const role = (formData.get("role") as string) ?? "CANDIDATE"; // CANDIDATE or EMPLOYER

  // 1. Validation
  const fieldErrors: Record<string, string> = {};
  if (!name.trim()) {
    fieldErrors.name = "Full name is required.";
  }
  if (!email.trim()) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_RE.test(email)) {
    fieldErrors.email = "Invalid email format.";
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters.";
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }
  if (role !== "CANDIDATE" && role !== "EMPLOYER") {
    fieldErrors.role = "Invalid account type.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  try {
    // 2. Unique Email Check
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }

    // 3. Create User
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role
      }
    });

    // 4. Automatically Log In
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      setupComplete: false
    });

    // 5. Redirect to profile setup
    if (role === "CANDIDATE") {
      redirect("/setup/candidate");
    } else {
      redirect("/setup/recruiter");
    }
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Signup Error:", err);
    return { success: false, error: "Could not create account. Please try again." };
  }
}

/**
 * Handle Logout Server Action
 */
export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

/**
 * Handle Forgot Password Server Action
 */
export async function forgotPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") as string) ?? "";

  if (!email.trim() || !EMAIL_RE.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // To prevent user enumeration, we return success even if the email doesn't exist
    if (user) {
      // Generate a short-lived token (1 hour)
      const token = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(RESET_SECRET_KEY);

      await sendResetPasswordEmail(user.email, token);
    }

    return {
      success: true,
      message: "If an account exists for this email, we have sent password reset instructions."
    };
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return { success: false, error: "Could not process request. Please try again." };
  }
}

/**
 * Handle Reset Password Server Action
 */
export async function resetPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const token = (formData.get("token") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  const fieldErrors: Record<string, string> = {};
  if (!token) {
    return { success: false, error: "Invalid or expired password reset token." };
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 6) {
    fieldErrors.password = "Password must be at least 6 characters.";
  }
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, RESET_SECRET_KEY, {
      algorithms: ["HS256"]
    });

    const userId = payload.userId as string;

    // Hash & update
    const hashed = await hashPassword(password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed }
    });

    return { success: true, message: "Your password has been reset. You can now log in." };
  } catch (err) {
    console.error("Reset Password Error:", err);
    return { success: false, error: "Invalid or expired password reset token." };
  }
}

/**
 * Candidate Profile Setup Action
 */
export async function setupCandidateAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") {
    return { success: false, error: "Unauthorized access." };
  }

  const name = (formData.get("name") as string) ?? "";
  const phone = (formData.get("phone") as string) ?? "";
  const linkedin = (formData.get("linkedin") as string) ?? "";
  const github = (formData.get("github") as string) ?? "";
  const experience = (formData.get("experience") as string) ?? "";
  const coverLetter = (formData.get("coverLetter") as string) ?? "";
  const resumeFile = formData.get("resume") as File | null;

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!name.trim()) fieldErrors.name = "Full name is required.";
  if (linkedin.trim() && !linkedin.includes("linkedin.com/")) {
    fieldErrors.linkedin = "Please enter a valid LinkedIn URL.";
  }
  if (github.trim() && !github.includes("github.com/")) {
    fieldErrors.github = "Please enter a valid GitHub URL.";
  }
  if (!experience) {
    fieldErrors.experience = "Please select your years of experience.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  try {
    let resumeUrl = null;

    // Handle resume file if uploaded
    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > 5 * 1024 * 1024) {
        return { success: false, fieldErrors: { resume: "File size must be 5 MB or less." } };
      }
      if (![
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ].includes(resumeFile.type)) {
        return { success: false, fieldErrors: { resume: "Only PDF, DOC, or DOCX files are accepted." } };
      }

      const bytes = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await fs.mkdir(uploadDir, { recursive: true });
      
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(resumeFile.name) || ".pdf";
      const fileName = `${Date.now()}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      
      await fs.writeFile(filePath, buffer);
      resumeUrl = `/uploads/resumes/${fileName}`;
    }

    // Upsert Candidate Profile
    await prisma.candidateProfile.upsert({
      where: { userId: session.userId },
      update: {
        name: name.trim(),
        phone: phone.trim() || null,
        linkedin: linkedin.trim() || null,
        github: github.trim() || null,
        experience,
        coverLetter: coverLetter.trim() || null,
        ...(resumeUrl ? { resumeUrl } : {})
      },
      create: {
        userId: session.userId,
        name: name.trim(),
        phone: phone.trim() || null,
        linkedin: linkedin.trim() || null,
        github: github.trim() || null,
        experience,
        coverLetter: coverLetter.trim() || null,
        resumeUrl: resumeUrl || ""
      }
    });

    // Update User Name
    await prisma.user.update({
      where: { id: session.userId },
      data: { name: name.trim() }
    });

    // Update session cookie with setupComplete = true
    await setSessionCookie({
      ...session,
      setupComplete: true
    });

    redirect("/candidate-dashboard");
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Setup Candidate Error:", err);
    return { success: false, error: "Could not save profile details." };
  }
}

/**
 * Recruiter Profile Setup Action
 */
export async function setupRecruiterAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    return { success: false, error: "Unauthorized access." };
  }

  const companyName = (formData.get("companyName") as string) ?? "";
  const website = (formData.get("website") as string) ?? "";
  const logoUrl = (formData.get("logoUrl") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";

  // Validation
  const fieldErrors: Record<string, string> = {};
  if (!companyName.trim()) fieldErrors.companyName = "Company name is required.";
  if (website.trim() && !URL_RE.test(website)) {
    fieldErrors.website = "Please enter a valid website URL.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  try {
    // Upsert Recruiter Profile (Employer)
    const employer = await prisma.employer.upsert({
      where: { userId: session.userId },
      update: {
        name: companyName.trim(),
        website: website.trim() || null,
        logoUrl: logoUrl.trim() || null,
        description: description.trim() || null
      },
      create: {
        userId: session.userId,
        name: companyName.trim(),
        website: website.trim() || null,
        logoUrl: logoUrl.trim() || null,
        description: description.trim() || null
      }
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: { name: `${companyName.trim()} HR` }
      }),
      prisma.job.updateMany({
        where: { employerId: employer.id },
        data: { company: companyName.trim() }
      })
    ]);

    // Update session cookie
    await setSessionCookie({
      ...session,
      setupComplete: true
    });

    revalidatePath("/jobs");
    revalidatePath("/recruiter-dashboard");
    revalidatePath("/recruiter-dashboard/manage-jobs");

    redirect("/recruiter-dashboard");
  } catch (err: any) {
    if (err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Setup Recruiter Error:", err);
    return { success: false, error: "Could not save company details." };
  }
}
