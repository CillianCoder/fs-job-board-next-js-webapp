import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CreateJobForm from "@/components/recruiter/CreateJobForm";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Edit Job Listing | Recruiter Dashboard",
  description: "Modify your posted career listing.",
};

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true },
  });

  if (!user?.employer) {
    redirect("/setup/recruiter");
  }

  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id,
      employerId: user.employer.id,
    },
  });

  if (!job) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <CreateJobForm categories={categories} job={job} companyName={user.employer.name} />;
}
