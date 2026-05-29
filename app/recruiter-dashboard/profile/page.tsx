import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2, Mail, Globe2, FileText, Edit, ExternalLink,
} from "lucide-react";
import ProfileSettingsForm from "@/app/components/ProfileSettingsForm";

export const metadata = {
  title: "Profile | Recruiter Dashboard | Devforge",
  description: "View and manage your company profile and account settings.",
};

export default async function RecruiterProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true },
  });

  if (!user || !user.employer) {
    redirect("/setup/recruiter");
  }

  const employer = user.employer;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Profile</h1>
        <p className="text-foreground/60 mt-1">Manage your company profile and account settings.</p>
      </div>

      <div className="space-y-8">
        {/* Company Information Section */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-4 h-4" />
                </div>
                Company Information
              </h2>
              <p className="text-sm text-foreground/60 mt-1">Your company details</p>
            </div>
            <Link
              href="/setup/recruiter"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 font-semibold rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit Company
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Company Name</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">{employer.name}</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Email</label>
              <div className="mt-2 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-foreground font-semibold">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Website */}
            {employer.website && (
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Website</label>
                <div className="mt-2">
                  <a
                    href={employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
                  >
                    <Globe2 className="w-4 h-4" />
                    {employer.website}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Logo */}
            {employer.logoUrl && (
              <div>
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Company Logo</label>
                <div className="mt-2">
                  <img
                    src={employer.logoUrl}
                    alt={employer.name}
                    className="h-16 w-16 object-contain rounded-lg border border-gray-200 dark:border-gray-800 p-2"
                  />
                </div>
              </div>
            )}

            {/* Description */}
            {employer.description && (
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Company Description</label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                  <p className="text-foreground text-sm whitespace-pre-wrap">{employer.description}</p>
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
