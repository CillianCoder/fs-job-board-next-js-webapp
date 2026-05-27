import prisma from "@/lib/prisma";
import CreateJobForm from "@/components/recruiter/CreateJobForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Post a Job | Recruiter Dashboard",
  description: "Create and publish a new engineering job listing.",
};

export default async function NewJobPage() {
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

  // Query all database categories dynamically to populate the dropdown
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <CreateJobForm categories={categories} companyName={user.employer.name} />;
}
