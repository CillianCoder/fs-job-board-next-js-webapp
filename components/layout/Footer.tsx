import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-background py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <span className="font-bold text-2xl tracking-tight">
            Dev<span className="text-primary">forge</span>
          </span>
        </Link>
        <p className="text-foreground/60 max-w-sm mb-6">
          The premier job board for software engineers, developers, and technical professionals.
        </p>
        <p className="text-sm text-foreground/60">
          &copy; {new Date().getFullYear()} Devforge. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

