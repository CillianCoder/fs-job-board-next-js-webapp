import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-background pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-2xl tracking-tight">
                Dev<span className="text-primary">forge</span>
              </span>
            </Link>
            <p className="text-foreground/60 max-w-sm">
              The premier job board for software engineers, developers, and technical professionals. Find your next great role here.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-foreground/60 hover:text-primary transition-colors">Search Jobs</Link></li>
              <li><Link href="/companies" className="text-foreground/60 hover:text-primary transition-colors">Browse Companies</Link></li>
              <li><Link href="/salary" className="text-foreground/60 hover:text-primary transition-colors">Salary Guide</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><Link href="/post-job" className="text-foreground/60 hover:text-primary transition-colors">Post a Job</Link></li>
              <li><Link href="/pricing" className="text-foreground/60 hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/resources" className="text-foreground/60 hover:text-primary transition-colors">Hiring Resources</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} Devforge. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-foreground/60 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-foreground/60 hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
