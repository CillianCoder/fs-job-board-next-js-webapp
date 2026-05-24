import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Users, Mail, Phone, Link2, Code2, 
  FileText, Calendar, ExternalLink, Briefcase 
} from "lucide-react";

export const metadata = {
  title: "Candidate Applications | Recruiter Dashboard",
  description: "Review and manage job applications submitted for your roles.",
};

export default async function ManageApplicationsPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  // Fetch employer
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true }
  });

  if (!user || !user.employer) {
    redirect("/setup/recruiter");
  }

  const employerId = user.employer.id;

  // Fetch all applications for jobs posted by this employer
  const applications = await prisma.application.findMany({
    where: {
      job: {
        employerId
      }
    },
    include: {
      job: true
    },
    orderBy: {
      appliedAt: "desc"
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidate Applications</h1>
        <p className="text-foreground/60 mt-1">Review resumes, portfolio links, and cover letters for your posted jobs.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl py-16 px-6 text-center shadow-sm">
          <Users className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
          <p className="text-sm text-foreground/50 max-w-sm mx-auto">
            Once candidates apply to your job listings, they will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div 
              key={app.id} 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Application Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-850">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {app.name}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/30 text-blue-650 border border-blue-100 dark:border-blue-900/30">
                      New
                    </span>
                  </h3>
                  <p className="text-sm text-foreground/50 font-medium">
                    Applied for <span className="font-bold text-foreground/75">{app.job.title}</span>
                  </p>
                </div>
                <div className="text-xs text-foreground/45 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(app.appliedAt).toLocaleDateString(undefined, { 
                    month: "short", day: "numeric", year: "numeric" 
                  })}
                </div>
              </div>

              {/* Application Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Contact info & Links */}
                <div className="space-y-3 border-r border-transparent md:border-gray-100 md:dark:border-gray-850 pr-4">
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Candidate Info</h4>
                  
                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Mail className="w-4 h-4 text-foreground/40 shrink-0" />
                    <a href={`mailto:${app.email}`} className="hover:text-primary hover:underline truncate">
                      {app.email}
                    </a>
                  </div>

                  {app.phone && (
                    <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                      <Phone className="w-4 h-4 text-foreground/40 shrink-0" />
                      <span>{app.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium">
                    <Briefcase className="w-4 h-4 text-foreground/40 shrink-0" />
                    <span>
                      Experience: {app.experience === "0-1" ? "Less than 1 year" : 
                                   app.experience === "1-3" ? "1 – 3 years" : 
                                   app.experience === "3-5" ? "3 – 5 years" : 
                                   app.experience === "5-10" ? "5 – 10 years" : "10+ years"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-bold hover:underline"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        View Resume PDF <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    
                    {app.linkedin && (
                      <a
                        href={app.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline"
                      >
                        <Link2 className="w-4 h-4 shrink-0" />
                        LinkedIn Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {app.github && (
                      <a
                        href={app.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:underline"
                      >
                        <Code2 className="w-4 h-4 shrink-0" />
                        GitHub Portfolio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Cover letter */}
                <div className="md:col-span-2 space-y-2">
                  <h4 className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Cover Letter</h4>
                  {app.coverLetter ? (
                    <p className="text-sm text-foreground/80 leading-relaxed bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap">
                      {app.coverLetter}
                    </p>
                  ) : (
                    <p className="text-sm text-foreground/40 italic">No cover letter provided by the applicant.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
