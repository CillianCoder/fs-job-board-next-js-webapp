import { getJobs, getUniqueLocations } from "@/lib/jobs";
import ManageJobsClient from "@/components/recruiter/ManageJobsClient";

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
  const params = await searchParams;
  
  const query = params.query || "";
  const location = params.location || "";
  const type = params.type || "";
  const page = parseInt(params.page || "1", 10);
  
  // Define items per page (6)
  const limit = 6;

  // Server-side database fetch with pagination & search & filter params
  const { jobs, totalPages, totalJobs, currentPage } = await getJobs({
    query,
    location,
    type,
    page,
    limit,
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
