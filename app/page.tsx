import Image from "next/image";
import Link from "next/link";
import { Search, MapPin, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 z-10">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary w-fit">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              The #1 Job Board for Software Engineers
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Find Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-400">
                Engineering Role
              </span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-xl">
              Connect with top tech companies, startups, and innovative teams looking for your specific skills. Build the career you deserve.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl mt-4">
              <div className="flex items-center px-3 flex-1">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400"
                />
              </div>
              <div className="hidden sm:block w-px bg-gray-200 dark:bg-gray-800 my-2"></div>
              <div className="flex items-center px-3 flex-1 border-t sm:border-t-0 border-gray-200 dark:border-gray-800 pt-2 sm:pt-0">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="City, state, or remote" 
                  className="w-full bg-transparent border-none outline-none text-foreground placeholder:text-gray-400"
                />
              </div>
              <button className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-3 rounded-lg transition-colors whitespace-nowrap">
                Search Jobs
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-foreground/60">
              <span>Popular:</span>
              <div className="flex gap-2">
                <Link href="#" className="hover:text-primary transition-colors">React</Link>
                <Link href="#" className="hover:text-primary transition-colors">Python</Link>
                <Link href="#" className="hover:text-primary transition-colors">Node.js</Link>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform rotate-3 scale-105 z-0"></div>
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 aspect-[4/3]">
              <Image 
                src="/hero-image.png" 
                alt="Software engineers collaborating" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Opportunities</h2>
              <p className="text-foreground/60">Hand-picked roles from top tech companies.</p>
            </div>
            <Link href="/jobs" className="hidden sm:flex items-center text-primary font-medium hover:text-primary-hover transition-colors">
              View all jobs <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Senior Full Stack Engineer",
                company: "TechNova",
                location: "San Francisco, CA (Hybrid)",
                salary: "$140k - $180k",
                type: "Full-time",
                tags: ["React", "Node.js", "TypeScript"]
              },
              {
                title: "Frontend Developer",
                company: "DesignCo",
                location: "Remote",
                salary: "$110k - $140k",
                type: "Full-time",
                tags: ["Next.js", "Tailwind", "Figma"]
              },
              {
                title: "Backend Engineer",
                company: "DataFlow",
                location: "New York, NY",
                salary: "$130k - $170k",
                type: "Full-time",
                tags: ["Python", "Django", "PostgreSQL"]
              }
            ].map((job, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xl text-gray-500">
                    {job.company.charAt(0)}
                  </div>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {job.type}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-foreground/70 mb-4">{job.company}</p>
                <div className="flex flex-col gap-2 mb-6 text-sm text-foreground/60">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> {job.location}
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" /> {job.salary}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag, j) => (
                      <span key={j} className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-foreground/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 sm:hidden flex justify-center">
            <Link href="/jobs" className="flex items-center text-primary font-medium hover:text-primary-hover transition-colors">
              View all jobs <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Devforge?</h2>
            <p className="text-lg text-foreground/70">We focus specifically on software engineering roles, cutting out the noise so you can focus on finding the right fit.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Curated Opportunities",
                desc: "Every job posting is reviewed to ensure it's a legitimate, high-quality engineering role with transparent requirements."
              },
              {
                title: "Transparent Salaries",
                desc: "We encourage salary transparency. Over 80% of our listings include clear compensation ranges up front."
              },
              {
                title: "Direct Access",
                desc: "Apply directly to hiring managers or internal recruiters. No external recruiters or endless agency loops."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-foreground/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0"></div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[600px] h-[600px] bg-black/10 rounded-full blur-3xl z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">Ready to upgrade your career?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Join thousands of developers who have found their dream roles through Devforge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-lg bg-white text-primary font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Create an Account
            </Link>
            <Link href="/post-job" className="px-8 py-4 rounded-lg bg-transparent text-white font-bold text-lg border-2 border-white/30 hover:bg-white/10 transition-colors">
              Post a Job
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
