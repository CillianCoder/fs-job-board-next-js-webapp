import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xl">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">
            Dev<span className="text-primary">forge</span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/jobs" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Find Jobs
          </Link>
          <Link href="/companies" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Companies
          </Link>
          <Link href="/post-job" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Post a Job
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:block text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
