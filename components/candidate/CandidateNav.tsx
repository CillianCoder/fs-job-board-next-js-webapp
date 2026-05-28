"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function CandidateNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 overflow-x-auto">
      <Link
        href="/candidate-dashboard"
        className={`flex items-center gap-2 text-sm font-semibold h-14 border-b-2 transition-all ${
          pathname === "/candidate-dashboard"
            ? "text-primary border-primary font-bold"
            : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
        }`}
      >
        <LayoutDashboard className="w-4 h-4" />
        Overview
      </Link>
    </nav>
  );
}
