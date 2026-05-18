import prisma from "../lib/prisma";
import crypto from "crypto";
import { generateJobSlug } from "../utils/slugify";

async function test() {
  console.log("Running DB integration test...");
  
  const title = "Senior Test Engineer";
  const company = "TechNova Test Company";
  const location = "Remote";
  const salary = "$120k - $150k";
  const type = "Full-time";
  const tags = ["React", "TypeScript"];
  const categoryId = "default"; // we will test fallback creation
  const description = "Test job description details";

  try {
    const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const hrEmail = `hr@${companySlug || "generic"}.com`;

    console.log("1. Upserting user...");
    const user = await prisma.user.upsert({
      where: { email: hrEmail },
      update: {},
      create: {
        email: hrEmail,
        name: `${company} HR`,
        role: "EMPLOYER",
      },
    });
    console.log("User upserted:", user.id);

    console.log("2. Upserting employer...");
    const employer = await prisma.employer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        name: company,
        userId: user.id,
        description: `Profile for ${company}`,
      },
    });
    console.log("Employer upserted:", employer.id);

    console.log("3. Resolving category...");
    const categoryName = "Engineering"; // standard fallback name
    const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const cat = await prisma.category.upsert({
      where: { slug: catSlug },
      update: {},
      create: {
        name: categoryName,
        slug: catSlug,
        description: `Jobs related to ${categoryName}`,
      },
    });
    console.log("Category resolved:", cat.id);

    console.log("4. Creating job...");
    const shortId = crypto.randomBytes(4).toString("hex");
    const slug = generateJobSlug({ title, company, id: shortId });

    const newJob = await prisma.job.create({
      data: {
        id: shortId,
        title,
        company,
        location,
        salary,
        type,
        tags,
        slug,
        employerId: employer.id,
        categoryId: cat.id,
        description,
      },
    });
    console.log("Job created successfully in database!", newJob.id, newJob.slug);
    
    // Clean up test data
    console.log("5. Cleaning up test data...");
    await prisma.job.delete({ where: { id: shortId } });
    console.log("Cleanup complete!");
    
  } catch (err) {
    console.error("DATABASE INTEGRATION ERROR:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
