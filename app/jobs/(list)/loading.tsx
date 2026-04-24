import { Search, MapPin, Briefcase } from "lucide-react";

export default function JobsLoading() {
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Explore Opportunities</h1>
        <p className="text-lg text-foreground/70">
          Find your next role at top tech companies. Filter by role, location, or required skills.
        </p>
      </div>

      {/* Filter Skeleton - static looking to match actual filter but unresponsive or with placeholders */}
      <div className="bg-white dark:bg-gray-900 p-2 md:p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-2 mb-8 animate-pulse">
        <div className="flex items-center flex-1 px-3 py-2">
          <Search className="w-5 h-5 text-gray-300 dark:text-gray-700 mr-2 shrink-0" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
        </div>
        
        <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
        
        <div className="flex-1 px-3 py-2 flex items-center border-t md:border-t-0 border-gray-200 dark:border-gray-800">
          <MapPin className="w-5 h-5 text-gray-300 dark:text-gray-700 mr-2 shrink-0" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
        </div>
        
        <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
        
        <div className="flex-1 px-3 py-2 flex items-center border-t md:border-t-0 border-gray-200 dark:border-gray-800">
          <Briefcase className="w-5 h-5 text-gray-300 dark:text-gray-700 mr-2 shrink-0" />
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
        </div>
        
        <div className="bg-gray-200 dark:bg-gray-800 h-[48px] rounded-lg mt-2 md:mt-0 w-full md:w-[105px]"></div>
      </div>

      {/* Job Count Skeleton */}
      <div className="mb-6 h-5 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm flex flex-col h-[280px] animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-20 h-6 rounded-full bg-gray-200 dark:bg-gray-800"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3 mt-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-6"></div>
            
            <div className="flex flex-col gap-3 mb-6 mt-auto">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-300 dark:text-gray-700" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
            
            <div className="mt-auto pt-2 flex gap-2">
              <div className="w-16 h-6 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-20 h-6 rounded bg-gray-200 dark:bg-gray-800"></div>
              <div className="w-14 h-6 rounded bg-gray-200 dark:bg-gray-800"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
