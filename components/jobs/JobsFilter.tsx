"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import CustomSelect, { SelectOption } from "@/components/ui/CustomSelect";
export default function JobsFilter({ locations = [] }: { locations?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");

  const locationOptions = useMemo(() => {
    const uniqueLocs = Array.from(new Set(locations));
    const opts: SelectOption[] = [];
    
    // Check if Remote exists in any variation
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

  const typeOptions: SelectOption[] = [
    { label: "Full-time", value: "Full-time" },
    { label: "Contract", value: "Contract" },
    { label: "Part-time", value: "Part-time" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (query) params.set("q", query);
    else params.delete("q");
    
    if (location) params.set("location", location);
    else params.delete("location");
    
    if (type) params.set("type", type);
    else params.delete("type");
    
    params.delete("page");
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-900 p-2 md:p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-2 mb-8">
      <div className="flex items-center flex-1 px-3 py-2">
        <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Job title, skills, or company" 
          className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
      
      <div className="flex-1 px-3 border-t md:border-t-0 border-gray-200 dark:border-gray-800">
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
      
      <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
      
      <div className="flex-1 px-3 border-t md:border-t-0 border-gray-200 dark:border-gray-800">
        <CustomSelect 
          options={typeOptions}
          value={type}
          onChange={setType}
          placeholder="Job Type"
          icon={<Briefcase className="w-5 h-5" />}
          className="text-sm h-full"
        />
      </div>
      
      <button type="submit" className="bg-primary hover:bg-primary-hover text-white font-medium px-8 py-3 rounded-lg transition-colors mt-2 md:mt-0 whitespace-nowrap shadow-sm">
        Search
      </button>
    </form>
  );
}
