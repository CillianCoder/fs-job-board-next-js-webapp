import prisma from "@/lib/prisma";
import CreateJobForm from "@/components/recruiter/CreateJobForm";

export const metadata = {
  title: "Post a Job | Recruiter Dashboard",
  description: "Create and publish a new engineering job listing.",
};

export default async function NewJobPage() {
  // Query all database categories dynamically to populate the dropdown
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <CreateJobForm categories={categories} />;
}
