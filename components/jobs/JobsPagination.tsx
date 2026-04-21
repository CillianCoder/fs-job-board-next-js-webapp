"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function JobsPagination({ totalPages, currentPage }: { totalPages: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `/jobs?${params.toString()}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-12">
      <button
        onClick={() => router.push(createPageURL(currentPage - 1))}
        disabled={currentPage <= 1}
        className="p-2 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => router.push(createPageURL(page))}
            className={`w-10 h-10 rounded-md font-medium transition-colors ${
              currentPage === page 
                ? "bg-primary text-white" 
                : "border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => router.push(createPageURL(currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
