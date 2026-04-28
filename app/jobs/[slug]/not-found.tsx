import Link from "next/link";
import { Search, ArrowLeft, Briefcase, RefreshCcw } from "lucide-react";

export default function JobNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-background py-24 px-4">
      <div className="w-full max-w-xl mx-auto text-center">

        {/* Animated icon stack */}
        <div className="relative w-28 h-28 mx-auto mb-10">
          {/* Outer glow ring */}
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-60" />
          {/* Mid ring */}
          <span className="absolute inset-2 rounded-full bg-primary/15" />
          {/* Icon container */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Briefcase className="w-9 h-9 text-primary" strokeWidth={1.5} />
            </span>
          </span>
        </div>

        {/* Error code badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-5">
          <span className="flex h-2 w-2 rounded-full bg-primary" />
          404 — Listing Not Found
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
          This job has{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
            moved on.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-foreground/60 mb-10 max-w-md mx-auto leading-relaxed">
          The listing you&apos;re looking for may have been filled, removed, or
          the link might be outdated. Don&apos;t worry — there are plenty of
          great roles waiting for you.
        </p>

        {/* Divider with icon */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <RefreshCcw className="w-4 h-4 text-foreground/30" />
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Suggested actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 w-full sm:w-auto justify-center"
          >
            <Search className="w-4 h-4" />
            Browse All Jobs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-foreground font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Helpful tips */}
        <div className="mt-14 grid sm:grid-cols-3 gap-5 text-left">
          {[
            {
              label: "Search by skill",
              desc: "Try filtering by your stack — React, Python, Go, and more.",
            },
            {
              label: "Filter by location",
              desc: "Narrow down remote, hybrid, or on-site roles near you.",
            },
            {
              label: "Check back soon",
              desc: "New listings are added daily. Bookmark the jobs page.",
            },
          ].map((tip) => (
            <div
              key={tip.label}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground mb-1">
                {tip.label}
              </p>
              <p className="text-sm text-foreground/60 leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
