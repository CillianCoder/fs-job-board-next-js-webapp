"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import { setupCandidateAction, ActionState } from "@/app/actions/auth";
import { 
  User, Mail, Phone, Link2, Code2, ChevronDown, 
  Upload, FileText, Loader2, ArrowRight, UserCheck 
} from "lucide-react";

interface SetupProps {
  initialName: string;
  initialPhone: string;
  initialLinkedin: string;
  initialGithub: string;
  initialExperience: string;
  initialCoverLetter: string;
  initialResumeUrl: string;
}

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1 – 3 years" },
  { value: "3-5", label: "3 – 5 years" },
  { value: "5-10", label: "5 – 10 years" },
  { value: "10+", label: "10+ years" },
];

export default function CandidateSetupClient({
  initialName,
  initialPhone,
  initialLinkedin,
  initialGithub,
  initialExperience,
  initialCoverLetter,
  initialResumeUrl,
}: SetupProps) {
  const [state, action, isPending] = useActionState(setupCandidateAction, { success: false });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);
  
  const [values, setValues] = useState({
    name: initialName,
    phone: initialPhone,
    linkedin: initialLinkedin,
    github: initialGithub,
    experience: initialExperience,
    coverLetter: initialCoverLetter,
  });

  const handleValueChange = (field: string, val: string) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (resumeFile) {
      formData.set("resume", resumeFile);
    }
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950/50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Candidate Profile Setup</h1>
          <p className="text-sm text-foreground/60 mt-2">
            Set up your developer profile. This details will be pre-filled automatically when applying to jobs.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 relative z-10">
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-650 dark:text-red-400">
              {state.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-foreground/80 mb-2">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={values.name}
                  onChange={(e) => handleValueChange("name", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                    state.fieldErrors?.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                  placeholder="Jane Smith"
                />
              </div>
              {state.fieldErrors?.name && (
                <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.name}</p>
              )}
            </div>

            {/* Phone & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground/80 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => handleValueChange("phone", e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-foreground/80 mb-2">
                  Experience Level <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <select
                    id="experience"
                    name="experience"
                    required
                    value={values.experience}
                    onChange={(e) => handleValueChange("experience", e.target.value)}
                    className={`w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                      state.fieldErrors?.experience ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                    } text-foreground text-sm appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                  >
                    <option value="">Select experience level...</option>
                    {EXPERIENCE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                </div>
                {state.fieldErrors?.experience && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.experience}</p>
                )}
              </div>
            </div>

            {/* Social Portfolios */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-semibold text-foreground/80 mb-2">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                    <Link2 className="w-4 h-4" />
                  </span>
                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={values.linkedin}
                    onChange={(e) => handleValueChange("linkedin", e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                      state.fieldErrors?.linkedin ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                    } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                {state.fieldErrors?.linkedin && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.linkedin}</p>
                )}
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-semibold text-foreground/80 mb-2">
                  GitHub Portfolio URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                    <Code2 className="w-4 h-4" />
                  </span>
                  <input
                    id="github"
                    name="github"
                    type="url"
                    value={values.github}
                    onChange={(e) => handleValueChange("github", e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                      state.fieldErrors?.github ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                    } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                    placeholder="https://github.com/username"
                  />
                </div>
                {state.fieldErrors?.github && (
                  <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.github}</p>
                )}
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <label htmlFor="resume" className="block text-sm font-semibold text-foreground/80 mb-2">
                Resume / CV <span className="text-primary">*</span>
              </label>
              <input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
              />
              <label
                htmlFor="resume"
                onDragOver={(e) => { e.preventDefault(); setResumeDragOver(true); }}
                onDragLeave={() => setResumeDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setResumeDragOver(false);
                  setResumeFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-all ${
                  resumeDragOver 
                    ? "border-primary bg-primary/5" 
                    : state.fieldErrors?.resume 
                    ? "border-red-400 bg-red-50 dark:bg-red-950/20" 
                    : resumeFile 
                    ? "border-green-455 bg-green-50 dark:bg-green-950/20" 
                    : "border-gray-200 dark:border-gray-800 hover:border-primary hover:bg-primary/5"
                }`}
              >
                {resumeFile ? (
                  <>
                    <FileText className="w-10 h-10 text-green-500 animate-bounce" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{resumeFile.name}</span>
                    <span className="text-xs text-foreground/50">{(resumeFile.size / 1024).toFixed(0)} KB · Drag & drop to replace</span>
                  </>
                ) : initialResumeUrl ? (
                  <>
                    <FileText className="w-10 h-10 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Current resume uploaded</span>
                    <span className="text-xs text-foreground/50">Click to upload new resume or drag here</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-foreground/30" />
                    <span className="text-sm font-medium text-foreground">Drag & drop your resume here, or browse</span>
                    <span className="text-xs text-foreground/40">PDF, DOC, DOCX · Max 5MB</span>
                  </>
                )}
              </label>
              {state.fieldErrors?.resume && (
                <p className="mt-2 text-xs font-semibold text-red-650 dark:text-red-400">{state.fieldErrors.resume}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="coverLetter" className="text-sm font-semibold text-foreground/80">
                  Cover Letter (Optional)
                </label>
                <span className="text-xs text-foreground/40">
                  {values.coverLetter.length}/2000
                </span>
              </div>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows={5}
                maxLength={2000}
                value={values.coverLetter}
                onChange={(e) => handleValueChange("coverLetter", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all resize-none"
                placeholder="Write a brief cover letter describing yourself and your skills..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-75 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
