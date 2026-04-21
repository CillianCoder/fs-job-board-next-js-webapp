"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";

export default function JobsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) params.set("q", query);
    else params.delete("q");
    
    if (location) params.set("location", location);
    else params.delete("location");
    
    if (type) params.set("type", type);
    else params.delete("type");
    
    // reset to page 1 on new search
    params.delete("page");
    
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex items-center flex-1 px-2">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="Job title, skills, or company" 
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
      <div className="flex items-center flex-1 px-2 border-t md:border-t-0 border-gray-200 dark:border-gray-800 pt-3 md:pt-0">
        <MapPin className="w-5 h-5 text-gray-400 mr-2" />
        <input 
          type="text" 
          placeholder="City, state, or remote" 
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
      <div className="flex items-center flex-1 px-2 border-t md:border-t-0 border-gray-200 dark:border-gray-800 pt-3 md:pt-0">
        <select 
          className="w-full bg-transparent border-none outline-none text-foreground cursor-pointer"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="" className="bg-background text-foreground">Any Job Type</option>
          <option value="Full-time" className="bg-background text-foreground">Full-time</option>
          <option value="Contract" className="bg-background text-foreground">Contract</option>
          <option value="Part-time" className="bg-background text-foreground">Part-time</option>
        </select>
      </div>
      <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2 rounded-lg transition-colors mt-2 md:mt-0 whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
