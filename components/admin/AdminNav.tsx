"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  User, 
  FileText, 
  Settings 
} from "lucide-react";

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin-dashboard/users", label: "Users", icon: Users },
    { href: "/admin-dashboard/recruiters", label: "Recruiters", icon: Building2 },
    { href: "/admin-dashboard/candidates", label: "Candidates", icon: User },
    { href: "/admin-dashboard/applications", label: "Applications", icon: FileText },
    { href: "/admin-dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-6 overflow-x-auto scrollbar-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 text-sm font-semibold h-14 border-b-2 transition-all shrink-0 ${
              isActive
                ? "text-primary border-primary font-bold"
                : "text-foreground/60 border-transparent hover:text-foreground hover:border-foreground/30"
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
