"use server";

import prisma from "@/lib/prisma";
import { generateJobSlug } from "@/utils/slugify";
import { revalidatePath } from "next/cache";
import { JobFieldErrors } from "./create-job";

export type EditJobState = {
  success: boolean;
  errors?: JobFieldErrors;
  globalError?: string;
};

const SALARY_RE = /^\$\d+k\s*-\s*\$\d+k$/i; // e.g. $100k - $150k

function validateFields(data: {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  tags: string;
  categoryId: string;
  description: string;
}): JobFieldErrors {
  const errors: JobFieldErrors = {};
  const { title, company, location, salary, type, tags, categoryId, description } = data;

  // Title
  if (!title.trim()) {
    errors.title = "Job title is required.";
  } else if (title.trim().length < 5) {
    errors.title = "Job title must be at least 5 characters.";
  } else if (title.trim().length > 100) {
    errors.title = "Job title must be 100 characters or fewer.";
  }

  // Company
  if (!company.trim()) {
    errors.company = "Company name is required.";
  } else if (company.trim().length < 2) {
    errors.company = "Company name must be at least 2 characters.";
  }

  // Location
  if (!location.trim()) {
    errors.location = "Job location is required (e.g. 'Remote' or 'San Francisco, CA').";
  }

  // Salary
  if (!salary.trim()) {
    errors.salary = "Salary range is required.";
  } else if (!SALARY_RE.test(salary.trim())) {
    errors.salary = "Please enter salary in the format '$120k - $150k'.";
  }

  // Job Type
  const validTypes = ["Full-time", "Part-time", "Contract", "Remote"];
  if (!type || !validTypes.includes(type)) {
    errors.type = "Please select a valid job type.";
  }

  // Tags
  if (!tags.trim()) {
    errors.tags = "Please enter at least one tag or skill.";
  }

  // Category
  if (!categoryId || categoryId === "default") {
    errors.categoryId = "Please select a job category.";
  }

  // Description
  if (description.trim() && description.trim().length < 10) {
    errors.description = "Job description should be at least 10 characters if provided.";
  }

  return errors;
}

export async function editJob(
  _prevState: EditJobState,
  formData: FormData
): Promise<EditJobState> {
  const id = (formData.get("id") as string) ?? "";
  const title = (formData.get("title") as string) ?? "";
  const company = (formData.get("company") as string) ?? "";
  const location = (formData.get("location") as string) ?? "";
  const salary = (formData.get("salary") as string) ?? "";
  const type = (formData.get("type") as string) ?? "";
  const tagsString = (formData.get("tags") as string) ?? "";
  const categoryId = (formData.get("categoryId") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";

  if (!id) {
    return { success: false, globalError: "Missing job ID." };
  }

  // Validate inputs
  const errors = validateFields({
    title,
    company,
    location,
    salary,
    type,
    tags: tagsString,
    categoryId,
    description,
  });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  try {
    // Parse tags to array
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Resilient Category Mapping
    let finalCategoryId = categoryId;
    const catExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!catExists) {
      const catSlug = categoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const cat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: categoryId,
          slug: catSlug,
          description: `Jobs related to ${categoryId}`,
        },
      });
      finalCategoryId = cat.id;
    }

    // Generate unique slug using existing short ID
    const slug = generateJobSlug({ title, company, id });

    // Update Job in database
    await prisma.job.update({
      where: { id },
      data: {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary.trim(),
        type,
        tags,
        slug,
        categoryId: finalCategoryId,
        description: description.trim() || null,
      },
    });

    // Revalidate paths to clear search caches
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${slug}`);
    revalidatePath("/recruiter-dashboard/manage-jobs");

    return { success: true };
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      success: false,
      globalError: "Failed to update job listing. Please check details and try again.",
    };
  }
}
