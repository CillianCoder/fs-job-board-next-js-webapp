import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import CreateJobForm from "@/components/recruiter/CreateJobForm";

export const metadata = {
  title: "Edit Job Listing | Recruiter Dashboard",
  description: "Modify your posted career listing.",
};

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <CreateJobForm categories={categories} job={job} />;
}
