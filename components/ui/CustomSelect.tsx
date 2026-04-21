"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  icon,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div 
        className="flex items-center w-full cursor-pointer h-full py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <div className="mr-2 text-gray-400 shrink-0">{icon}</div>}
        <div className={`flex-1 truncate ${!selectedOption ? "text-gray-400" : "text-foreground"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full min-w-[240px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 shrink-0 relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-gray-800 border-none outline-none text-sm py-2 pl-8 pr-3 rounded-md focus:ring-1 focus:ring-primary/50"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          <div className="overflow-y-auto flex-1 p-1">
            <div
              className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 ${value === "" ? "font-medium" : ""}`}
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              <span>Any</span>
              {value === "" && <Check className="w-4 h-4 text-primary" />}
            </div>
            
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-sm text-center text-gray-500">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between
                    ${value === opt.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50 dark:hover:bg-gray-800"}
                  `}
                  onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(""); }}
                >
                  <span className={`flex items-center ${opt.highlight ? "text-primary font-semibold" : ""}`}>
                    {opt.highlight && <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>}
                    {opt.label}
                  </span>
                  {value === opt.value && <Check className="w-4 h-4 text-primary" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
