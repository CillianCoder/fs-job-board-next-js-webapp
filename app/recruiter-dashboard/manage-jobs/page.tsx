import { getJobs, getUniqueLocations } from "@/lib/jobs";
import ManageJobsClient from "@/components/recruiter/ManageJobsClient";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Manage Jobs | Recruiter Dashboard",
  description: "View, filter, search and preview your job listings.",
};

interface PageProps {
  searchParams: Promise<{
    query?: string;
    location?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function ManageJobsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  // Get employer details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true }
  });

  if (!user || !user.employer) {
    redirect("/setup/recruiter");
  }

  const params = await searchParams;
  
  const query = params.query || "";
  const location = params.location || "";
  const type = params.type || "";
  const page = parseInt(params.page || "1", 10);
  
  // Define items per page (6)
  const limit = 6;

  // Server-side database fetch with pagination & search & filter params, scoped to this employer
  const { jobs, totalPages, totalJobs, currentPage } = await getJobs({
    query,
    location,
    type,
    page,
    limit,
    employerId: user.employer.id
  });

  // Get unique locations to populate our filter dropdown dynamically
  const uniqueLocations = await getUniqueLocations();

  return (
    <ManageJobsClient
      jobs={jobs}
      totalPages={totalPages}
      totalJobs={totalJobs}
      currentPage={currentPage}
      locations={uniqueLocations}
    />
  );
}
