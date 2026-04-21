import { jobs } from "@/data/jobs";
import JobCard from "@/components/jobs/JobCard";
import JobsFilter from "@/components/jobs/JobsFilter";
import JobsPagination from "@/components/jobs/JobsPagination";

export const metadata = {
  title: "Search Jobs | Devforge",
  description: "Find the best software engineering jobs.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q.toLowerCase() : "";
  const location = typeof resolvedParams.location === "string" ? resolvedParams.location.toLowerCase() : "";
  const type = typeof resolvedParams.type === "string" ? resolvedParams.type : "";
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  
  const ITEMS_PER_PAGE = 9;

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesQuery = query === "" || 
      job.title.toLowerCase().includes(query) || 
      job.company.toLowerCase().includes(query) ||
      job.tags.some(tag => tag.toLowerCase().includes(query));
      
    const matchesLocation = location === "" || job.location.toLowerCase().includes(location);
    const matchesType = type === "" || job.type === type;
    
    return matchesQuery && matchesLocation && matchesType;
  });

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const currentJobs = filteredJobs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Explore Opportunities</h1>
        <p className="text-lg text-foreground/70">
          Find your next role at top tech companies. Filter by role, location, or required skills.
        </p>
      </div>

      <JobsFilter />

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-2">No jobs found</h2>
          <p className="text-foreground/70">Try adjusting your search criteria or removing filters.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 text-sm font-medium text-foreground/70">
            Showing {currentJobs.length} of {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <JobsPagination totalPages={totalPages} currentPage={page} />
        </>
      )}
    </div>
  );
}
