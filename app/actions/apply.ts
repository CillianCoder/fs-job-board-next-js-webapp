"use server";

import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  experience?: string;
  resume?: string;
  coverLetter?: string;
};

export type ApplyState = {
  success: boolean;
  errors?: FieldErrors;
  globalError?: string;
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{7,15}$/;
const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\//i;
const GITHUB_RE = /^https:\/\/(www\.)?github\.com\//i;
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXPERIENCE_OPTIONS = ["0-1", "1-3", "3-5", "5-10", "10+"];

function validateFields(data: {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  experience: string;
  resumeFile: File | null;
  coverLetter: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const { name, email, phone, linkedin, github, experience, resumeFile, coverLetter } =
    data;

  // Full Name
  const trimmedName = name.trim();
  if (!trimmedName) {
    errors.name = "Full name is required.";
  } else if (trimmedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (trimmedName.length > 100) {
    errors.name = "Name must be 100 characters or fewer.";
  }

  // Email
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  // Phone (optional)
  const trimmedPhone = phone.trim();
  if (trimmedPhone && !PHONE_RE.test(trimmedPhone)) {
    errors.phone = "Please enter a valid phone number (7–15 digits).";
  }

  // LinkedIn (optional)
  const trimmedLinkedin = linkedin.trim();
  if (trimmedLinkedin && !LINKEDIN_RE.test(trimmedLinkedin)) {
    errors.linkedin =
      "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname).";
  }

  // GitHub (optional)
  const trimmedGithub = github.trim();
  if (trimmedGithub && !GITHUB_RE.test(trimmedGithub)) {
    errors.github =
      "Please enter a valid GitHub URL (e.g. https://github.com/yourusername).";
  }

  // Years of experience
  if (!experience || !EXPERIENCE_OPTIONS.includes(experience)) {
    errors.experience = "Please select your years of experience.";
  }

  // Resume
  if (!resumeFile || resumeFile.size === 0) {
    errors.resume = "Please upload your resume or CV.";
  } else if (!ALLOWED_MIME.includes(resumeFile.type)) {
    errors.resume = "Only PDF, DOC, or DOCX files are accepted.";
  } else if (resumeFile.size > MAX_FILE_BYTES) {
    errors.resume = "File size must be 5 MB or less.";
  }

  // Cover Letter (optional, max length)
  if (coverLetter.length > 2000) {
    errors.coverLetter = "Cover letter must be 2 000 characters or fewer.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

export async function applyToJob(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  // Extract raw values
  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const phone = (formData.get("phone") as string) ?? "";
  const linkedin = (formData.get("linkedin") as string) ?? "";
  const github = (formData.get("github") as string) ?? "";
  const experience = (formData.get("experience") as string) ?? "";
  const resumeFile = formData.get("resume") as File | null;
  const coverLetter = (formData.get("coverLetter") as string) ?? "";
  const jobId = (formData.get("jobId") as string) ?? "";

  // Server-side validation
  const errors = validateFields({
    name,
    email,
    phone,
    linkedin,
    github,
    experience,
    resumeFile,
    coverLetter,
  });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  // -------------------------------------------------------------------------
  // Stub: persist application & send confirmation email.
  // Replace this block with your real DB insert / email service call.
  // -------------------------------------------------------------------------
  try {
    if (!resumeFile) {
      throw new Error("Resume file is required");
    }

    // Prepare file upload
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(resumeFile.name) || ".pdf";
    const fileName = `${Date.now()}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    
    // Save file locally
    await fs.writeFile(filePath, buffer);
    const resumeUrl = `/uploads/resumes/${fileName}`;

    // Save to database
    await prisma.application.create({
      data: {
        jobId,
        name,
        email,
        phone: phone || null,
        linkedin: linkedin || null,
        github: github || null,
        experience,
        coverLetter: coverLetter || null,
        resumeUrl
      }
    });

    console.info(`[applyToJob] Application saved to DB — jobId: ${jobId}, applicant: ${email}`);

    return { success: true };
  } catch (error) {
    console.error("Error saving application:", error);
    return {
      success: false,
      globalError:
        "Something went wrong on our end. Please try again in a moment.",
    };
  }
}
