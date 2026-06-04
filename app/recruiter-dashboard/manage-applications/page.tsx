import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ManageApplicationsClient from "./ManageApplicationsClient";
import { getRecruiterApplications, getRecruiterJobs } from "@/app/actions/applications";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Manage Applications | Recruiter Dashboard",
  description: "Review, filter, and manage job applications with status tracking.",
};

export default async function ManageApplicationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  // Verify employer exists
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true },
  });

  if (!user || !user.employer) {
    redirect("/setup/recruiter");
  }

  // Parse query parameters
  const page = parseInt((searchParams.page as string) || "1", 10);
  const pageSize = parseInt((searchParams.pageSize as string) || "10", 10);
  const status = searchParams.status as string | undefined;
  const jobId = searchParams.jobId as string | undefined;
  const searchQuery = searchParams.search as string | undefined;
  const dateFromStr = searchParams.dateFrom as string | undefined;
  const dateToStr = searchParams.dateTo as string | undefined;
  const sortBy = (searchParams.sortBy as "date" | "status" | "name") || "date";

  // Parse dates
  const dateFrom = dateFromStr ? new Date(dateFromStr) : undefined;
  const dateTo = dateToStr ? new Date(dateToStr) : undefined;

  // Fetch applications and jobs
  const [applicationsData, jobsData] = await Promise.all([
    getRecruiterApplications(page, pageSize, {
      status,
      jobId,
      searchQuery,
      dateFrom,
      dateTo,
    }, sortBy),
    getRecruiterJobs(),
  ]);

  if (!applicationsData || !jobsData) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Suspense fallback={<div>Loading...</div>}>
        <ManageApplicationsClient
          initialApplications={applicationsData.applications}
          total={applicationsData.total}
          page={applicationsData.page}
          pageSize={applicationsData.pageSize}
          totalPages={applicationsData.totalPages}
          statusCounts={applicationsData.statusCounts}
          jobs={jobsData}
        />
      </Suspense>
    </div>
  );
}
