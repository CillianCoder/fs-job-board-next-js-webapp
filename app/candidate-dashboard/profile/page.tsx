import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Link2,
  Code2,
  FileText,
  Edit,
  ExternalLink,
} from "lucide-react";
import ProfileSettingsForm from "@/app/components/ProfileSettingsForm";

export const metadata = {
  title: "Profile | Candidate Dashboard | Devforge",
  description: "View and manage your candidate profile and account settings.",
};

const EXPERIENCE_OPTIONS: Record<string, string> = {
  "0-1": "Less than 1 year",
  "1-3": "1 – 3 years",
  "3-5": "3 – 5 years",
  "5-10": "5 – 10 years",
  "10+": "10+ years",
};

export default async function CandidateProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { candidate: true },
  });

  if (!user || !user.candidate) {
    redirect("/setup/candidate");
  }

  const candidate = user.candidate;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="text-foreground/60 mt-1">
          Manage your candidate profile and account settings.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Information Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                Profile Information
              </h2>
              <p className="text-sm text-foreground/60 mt-1">
                Your professional details
              </p>
            </div>
            <Link
              href="/setup/candidate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-semibold rounded-lg transition-all">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                Full Name
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">
                    {candidate.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                Email
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                Phone Number
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
                  <Phone className="w-5 h-5" />
                </div>
                <p className="text-foreground font-semibold">
                  {candidate.phone || "Not provided"}
                </p>
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                Experience Level
              </label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-foreground font-semibold">
                  {EXPERIENCE_OPTIONS[candidate.experience!] || "Not specified"}
                </p>
              </div>
            </div>

            {/* LinkedIn */}
            {candidate.linkedin && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                  LinkedIn
                </label>
                <div className="mt-2">
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
                    <Link2 className="w-4 h-4" />
                    {candidate.linkedin}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* GitHub */}
            {candidate.github && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                  GitHub
                </label>
                <div className="mt-2">
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
                    <Code2 className="w-4 h-4" />
                    {candidate.github}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Resume */}
            {candidate.resumeUrl && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                  Resume
                </label>
                <div className="mt-2">
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold">
                    <FileText className="w-4 h-4" />
                    Download Resume
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {candidate.coverLetter && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                  Cover Letter
                </label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-foreground text-sm whitespace-pre-wrap">
                    {candidate.coverLetter}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <ProfileSettingsForm />
      </div>
    </div>
  );
}
