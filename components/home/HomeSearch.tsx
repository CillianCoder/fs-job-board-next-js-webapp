"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import CustomSelect, { SelectOption } from "@/components/ui/CustomSelect";
import { jobs } from "@/data/jobs";
import { useRouter } from "next/navigation";

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const locationOptions = useMemo(() => {
    const uniqueLocs = Array.from(new Set(jobs.map(j => j.location)));
    const opts: SelectOption[] = [];
    
    const hasRemote = uniqueLocs.some(l => l.toLowerCase().includes("remote"));
    if (hasRemote) {
      opts.push({ label: "Remote", value: "Remote", highlight: true });
    }

    uniqueLocs.forEach(loc => {
      if (!loc.toLowerCase().includes("remote")) {
        opts.push({ label: loc, value: loc });
      }
    });

    return opts.sort((a, b) => {
      if (a.highlight) return -1;
      if (b.highlight) return 1;
      return a.label.localeCompare(b.label);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl mt-4">
      <div className="flex items-center px-3 py-2 flex-1">
        <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Job title, keywords, or company" 
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
      <div className="flex-1 px-3 border-t sm:border-t-0 border-gray-200 dark:border-gray-800">
        <CustomSelect 
          options={locationOptions}
          value={location}
          onChange={setLocation}
          placeholder="Location"
          searchable={true}
          icon={<MapPin className="w-5 h-5" />}
          className="text-sm h-full"
        />
      </div>
      <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap shadow-sm mt-2 sm:mt-0">
        Search Jobs
      </button>
    </form>
  );
}
