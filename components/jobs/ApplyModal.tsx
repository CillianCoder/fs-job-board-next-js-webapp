"use client";

import { useActionState, useEffect, useRef, useState, useCallback } from "react";
import { applyToJob, type ApplyState, type FieldErrors } from "@/app/actions/apply";
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Briefcase,
  FileText,
  User,
  Mail,
  Phone,
  Link2,
  Code2,
  ChevronDown,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  company: string;
  isLoggedIn: boolean;
  userRole: string | null;
  candidateProfile?: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    experience: string;
    resumeUrl: string;
  };
}

type FieldName = keyof FieldErrors;

// ---------------------------------------------------------------------------
// Client-side validation (mirrors server rules exactly)
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d\s\-().]{7,15}$/;
const LINKEDIN_RE = /^https:\/\/(www\.)?linkedin\.com\//i;
const GITHUB_RE = /^https:\/\/(www\.)?github\.com\//i;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "Less than 1 year" },
  { value: "1-3", label: "1 – 3 years" },
  { value: "3-5", label: "3 – 5 years" },
  { value: "5-10", label: "5 – 10 years" },
  { value: "10+", label: "10+ years" },
];

function validateClient(
  name: string,
  email: string,
  phone: string,
  linkedin: string,
  github: string,
  experience: string,
  resumeFile: File | null,
  coverLetter: string,
  hasExistingResume: boolean
): FieldErrors {
  const errors: FieldErrors = {};

  const trimmedName = name.trim();
  if (!trimmedName) errors.name = "Full name is required.";
  else if (trimmedName.length < 2) errors.name = "Name must be at least 2 characters.";
  else if (trimmedName.length > 100) errors.name = "Name must be 100 characters or fewer.";

  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = "Email address is required.";
  else if (!EMAIL_RE.test(trimmedEmail)) errors.email = "Please enter a valid email address.";

  const trimmedPhone = phone.trim();
  if (trimmedPhone && !PHONE_RE.test(trimmedPhone))
    errors.phone = "Please enter a valid phone number (7–15 digits).";

  const trimmedLinkedin = linkedin.trim();
  if (trimmedLinkedin && !LINKEDIN_RE.test(trimmedLinkedin))
    errors.linkedin = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/yourname).";

  const trimmedGithub = github.trim();
  if (trimmedGithub && !GITHUB_RE.test(trimmedGithub))
    errors.github = "Please enter a valid GitHub URL (e.g. https://github.com/yourusername).";

  if (!experience) errors.experience = "Please select your years of experience.";

  if (!hasExistingResume) {
    if (!resumeFile || resumeFile.size === 0) {
      errors.resume = "Please upload your resume or CV.";
    } else if (!ALLOWED_MIME.includes(resumeFile.type)) {
      errors.resume = "Only PDF, DOC, or DOCX files are accepted.";
    } else if (resumeFile.size > MAX_FILE_BYTES) {
      errors.resume = "File size must be 5 MB or less.";
    }
  }

  if (coverLetter.length > 2000)
    errors.coverLetter = "Cover letter must be 2 000 characters or fewer.";

  return errors;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-1.5 text-xs text-red-500 mt-1.5" role="alert">
      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      {message}
    </p>
  );
}

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground mb-1.5">
      {children}
      {required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}

function inputClass(hasError: boolean, isReadOnly?: boolean) {
  return [
    "w-full px-3.5 py-2.5 rounded-lg text-sm bg-white dark:bg-gray-800",
    "border transition-colors outline-none",
    "placeholder:text-foreground/40",
    isReadOnly ? "bg-gray-50 dark:bg-gray-900 text-foreground/60 border-gray-150 dark:border-gray-800 cursor-not-allowed select-none focus:ring-0 focus:border-gray-150 dark:focus:border-gray-800" : "focus:ring-2 focus:ring-primary/20",
    !isReadOnly && (hasError
      ? "border-red-400 dark:border-red-500 focus:border-red-400"
      : "border-gray-200 dark:border-gray-700 focus:border-primary"),
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Success Screen
// ---------------------------------------------------------------------------

function SuccessScreen({
  jobTitle,
  company,
  onClose,
}: {
  jobTitle: string;
  company: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      {/* Animated checkmark */}
      <div className="relative mb-6">
        <span className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30 border-2 border-green-400">
          <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={1.5} />
        </span>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
      <p className="text-foreground/60 text-sm leading-relaxed max-w-xs mb-1">
        Your application for{" "}
        <span className="font-semibold text-foreground">{jobTitle}</span> at{" "}
        <span className="font-semibold text-foreground">{company}</span> has been received.
      </p>
      <p className="text-foreground/50 text-xs mb-8">
        We&apos;ll review it and reach out to you soon. Good luck! 🎉
      </p>

      <button
        onClick={onClose}
        className="px-8 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
      >
        Close
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Modal Component
// ---------------------------------------------------------------------------

const initialState: ApplyState = { success: false };

export default function ApplyModal({
  jobId,
  jobTitle,
  company,
  isLoggedIn,
  userRole,
  candidateProfile,
}: ApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeDragOver, setResumeDragOver] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectPath(window.location.pathname);
    }
  }, []);

  // Per-field "touched" state — only show errors after the user blurs a field
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  
  // Live client-side field values for blur validation
  const [values, setValues] = useState({
    name: candidateProfile?.name || "",
    email: candidateProfile?.email || "",
    phone: candidateProfile?.phone || "",
    linkedin: candidateProfile?.linkedin || "",
    github: candidateProfile?.github || "",
    experience: candidateProfile?.experience || "",
    coverLetter: "",
  });
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  // Sync state if profile changes/loads dynamically
  useEffect(() => {
    if (candidateProfile) {
      setValues({
        name: candidateProfile.name || "",
        email: candidateProfile.email || "",
        phone: candidateProfile.phone || "",
        linkedin: candidateProfile.linkedin || "",
        github: candidateProfile.github || "",
        experience: candidateProfile.experience || "",
        coverLetter: "",
      });
    }
  }, [candidateProfile]);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLButtonElement | HTMLAnchorElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Server Action wiring
  const [state, action, isPending] = useActionState(applyToJob, initialState);

  // ---------------------------------------------------------------------------
  // Merge client + server errors. Server errors take precedence after submit.
  // ---------------------------------------------------------------------------
  const displayErrors: FieldErrors = state.errors
    ? { ...clientErrors, ...state.errors }
    : clientErrors;

  // ---------------------------------------------------------------------------
  // Recompute client errors whenever touched fields change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const errs = validateClient(
      values.name,
      values.email,
      values.phone,
      values.linkedin,
      values.github,
      values.experience,
      resumeFile,
      values.coverLetter,
      !!candidateProfile?.resumeUrl
    );
    // Only surface errors for touched fields
    const filtered: FieldErrors = {};
    (Object.keys(errs) as FieldName[]).forEach((k) => {
      if (touched[k]) (filtered as Record<string, string>)[k] = errs[k] as string;
    });
    setClientErrors(filtered);
  }, [values, resumeFile, touched, candidateProfile]);

  // ---------------------------------------------------------------------------
  // Accessibility: trap focus & handle Escape
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    firstFieldRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setResumeFile(null);
      setTouched({});
      setValues({
        name: candidateProfile?.name || "",
        email: candidateProfile?.email || "",
        phone: candidateProfile?.phone || "",
        linkedin: candidateProfile?.linkedin || "",
        github: candidateProfile?.github || "",
        experience: candidateProfile?.experience || "",
        coverLetter: "",
      });
      setClientErrors({});
      formRef.current?.reset();
    }, 200);
  }, [candidateProfile]);

  const touch = (field: FieldName) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleValueChange = (field: keyof typeof values, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (file: File | null) => {
    setResumeFile(file);
    touch("resume");
  };

  // Touch all fields and validate before allowing server submit
  const handleSubmitAttempt = (e: React.FormEvent<HTMLFormElement>) => {
    const allTouched: Partial<Record<FieldName, boolean>> = {
      name: true, email: true, phone: true, linkedin: true, github: true,
      experience: true, resume: true, coverLetter: true,
    };
    setTouched(allTouched);

    const errs = validateClient(
      values.name, values.email, values.phone, values.linkedin, values.github,
      values.experience, resumeFile, values.coverLetter, !!candidateProfile?.resumeUrl
    );

    if (Object.keys(errs).length > 0) {
      e.preventDefault();
      setClientErrors(errs);
      // Scroll to first error
      const firstErrField = modalRef.current?.querySelector("[aria-invalid='true']") as HTMLElement;
      firstErrField?.focus();
    }
  };

  // Check user role validation
  const isCandidate = isLoggedIn && userRole === "CANDIDATE";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Trigger button */}
      <button
        id="apply-now-btn"
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors shadow-sm"
      >
        Apply Now
      </button>

      {/* Backdrop + Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="Apply modal backdrop"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal panel */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-modal-title"
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* ---- Gated Auth Messages ---- */}
            {!isCandidate ? (
              <div className="p-8 text-center">
                <div className="flex justify-end -mt-2 -mr-2">
                  <button
                    onClick={handleClose}
                    aria-label="Close modal"
                    className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5 text-amber-500">
                  <AlertCircle className="w-8 h-8" />
                </div>

                {!isLoggedIn ? (
                  <>
                    <h2 className="text-xl font-bold mb-3">Candidate Account Required</h2>
                    <p className="text-sm text-foreground/60 leading-relaxed mb-8 max-w-sm mx-auto">
                      To apply for jobs on Devforge, you must be logged in with a Candidate account. Please sign in or create an account to submit your application.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-foreground text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <a
                        ref={firstFieldRef as any}
                        href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                        className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-colors text-center"
                      >
                        Log In
                      </a>
                      <a
                        href="/signup"
                        className="px-6 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-foreground text-sm font-semibold transition-colors text-center"
                      >
                        Sign Up
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-3">Recruiter Account</h2>
                    <p className="text-sm text-foreground/60 leading-relaxed mb-8 max-w-sm mx-auto">
                      You are currently logged in as a Recruiter. Please sign out and sign in using a Candidate account to submit applications.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        ref={firstFieldRef as any}
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-foreground text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <a
                        href="/login"
                        className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-md transition-colors text-center"
                      >
                        Switch Account
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : state.success ? (
              <SuccessScreen
                jobTitle={jobTitle}
                company={company}
                onClose={handleClose}
              />
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2
                        id="apply-modal-title"
                        className="text-lg font-bold text-foreground leading-tight"
                      >
                        Apply for {jobTitle}
                      </h2>
                      <p className="text-sm text-foreground/60">{company}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    aria-label="Close modal"
                    className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Global server error */}
                {state.globalError && (
                  <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{state.globalError}</p>
                  </div>
                )}

                {/* Form */}
                <form
                  ref={formRef}
                  action={action}
                  onSubmit={handleSubmitAttempt}
                  noValidate
                  className="px-6 py-5 space-y-5"
                >
                  {/* Hidden inputs for jobId and existingResumeUrl */}
                  <input type="hidden" name="jobId" value={jobId} />
                  {candidateProfile?.resumeUrl && (
                    <input type="hidden" name="existingResumeUrl" value={candidateProfile.resumeUrl} />
                  )}

                  {/* ── Full Name ── */}
                  <div>
                    <Label htmlFor="apply-name" required>Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      <input
                        ref={firstFieldRef as any}
                        id="apply-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Jane Smith"
                        aria-invalid={!!displayErrors.name}
                        aria-describedby={displayErrors.name ? "err-name" : undefined}
                        value={values.name}
                        readOnly={!!candidateProfile?.name}
                        onChange={(e) => handleValueChange("name", e.target.value)}
                        onBlur={() => touch("name")}
                        className={inputClass(!!displayErrors.name, !!candidateProfile?.name) + " pl-9"}
                      />
                    </div>
                    <span id="err-name"><FieldError message={displayErrors.name} /></span>
                  </div>

                  {/* ── Email ── */}
                  <div>
                    <Label htmlFor="apply-email" required>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                      <input
                        id="apply-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="jane@example.com"
                        aria-invalid={!!displayErrors.email}
                        aria-describedby={displayErrors.email ? "err-email" : undefined}
                        value={values.email}
                        readOnly={!!candidateProfile?.email}
                        onChange={(e) => handleValueChange("email", e.target.value)}
                        onBlur={() => touch("email")}
                        className={inputClass(!!displayErrors.email, !!candidateProfile?.email) + " pl-9"}
                      />
                    </div>
                    <span id="err-email"><FieldError message={displayErrors.email} /></span>
                  </div>

                  {/* ── Phone + LinkedIn + GitHub row ── */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="apply-phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          id="apply-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 555 000 0000"
                          aria-invalid={!!displayErrors.phone}
                          aria-describedby={displayErrors.phone ? "err-phone" : undefined}
                          value={values.phone}
                          readOnly={!!candidateProfile?.phone}
                          onChange={(e) => handleValueChange("phone", e.target.value)}
                          onBlur={() => touch("phone")}
                          className={inputClass(!!displayErrors.phone, !!candidateProfile?.phone) + " pl-9"}
                        />
                      </div>
                      <span id="err-phone"><FieldError message={displayErrors.phone} /></span>
                    </div>

                    <div>
                      <Label htmlFor="apply-linkedin">LinkedIn</Label>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          id="apply-linkedin"
                          name="linkedin"
                          type="url"
                          autoComplete="url"
                          placeholder="https://linkedin.com/in/…"
                          aria-invalid={!!displayErrors.linkedin}
                          aria-describedby={displayErrors.linkedin ? "err-linkedin" : undefined}
                          value={values.linkedin}
                          readOnly={!!candidateProfile?.linkedin}
                          onChange={(e) => handleValueChange("linkedin", e.target.value)}
                          onBlur={() => touch("linkedin")}
                          className={inputClass(!!displayErrors.linkedin, !!candidateProfile?.linkedin) + " pl-9"}
                        />
                      </div>
                      <span id="err-linkedin"><FieldError message={displayErrors.linkedin} /></span>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="apply-github">GitHub Portfolio</Label>
                      <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                        <input
                          id="apply-github"
                          name="github"
                          type="url"
                          autoComplete="url"
                          placeholder="https://github.com/yourusername"
                          aria-invalid={!!displayErrors.github}
                          aria-describedby={displayErrors.github ? "err-github" : undefined}
                          value={values.github}
                          readOnly={!!candidateProfile?.github}
                          onChange={(e) => handleValueChange("github", e.target.value)}
                          onBlur={() => touch("github")}
                          className={inputClass(!!displayErrors.github, !!candidateProfile?.github) + " pl-9"}
                        />
                      </div>
                      <span id="err-github"><FieldError message={displayErrors.github} /></span>
                    </div>
                  </div>

                  {/* ── Experience ── */}
                  <div>
                    <Label htmlFor="apply-experience" required>Years of Experience</Label>
                    <div className="relative">
                      {candidateProfile?.experience && (
                        <input type="hidden" name="experience" value={values.experience} />
                      )}
                      <select
                        id="apply-experience"
                        name={candidateProfile?.experience ? "disabled-experience" : "experience"}
                        aria-invalid={!!displayErrors.experience}
                        aria-describedby={displayErrors.experience ? "err-experience" : undefined}
                        value={values.experience}
                        disabled={!!candidateProfile?.experience}
                        onChange={(e) => handleValueChange("experience", e.target.value)}
                        onBlur={() => touch("experience")}
                        className={
                          inputClass(!!displayErrors.experience, !!candidateProfile?.experience) +
                          " appearance-none pr-9 cursor-pointer"
                        }
                      >
                        <option value="">Select experience level…</option>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                    </div>
                    <span id="err-experience"><FieldError message={displayErrors.experience} /></span>
                  </div>

                  {/* ── Resume Upload ── */}
                  <div>
                    <Label htmlFor="apply-resume" required>Resume / CV</Label>
                    
                    {candidateProfile?.resumeUrl ? (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-solid border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 py-7 px-4 text-center cursor-not-allowed select-none">
                        <FileText className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                          Profile Resume Linked
                        </span>
                        <a
                          href={candidateProfile.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline font-medium hover:text-primary-hover pointer-events-auto"
                        >
                          View Current Profile Resume
                        </a>
                      </div>
                    ) : (
                      <>
                        <input
                          id="apply-resume"
                          name="resume"
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          aria-invalid={!!displayErrors.resume}
                          aria-describedby={displayErrors.resume ? "err-resume" : "resume-hint"}
                          className="sr-only"
                          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                          onBlur={() => touch("resume")}
                          tabIndex={-1}
                        />
                        {/* Drag-and-drop zone */}
                        <label
                          htmlFor="apply-resume"
                          onDragOver={(e) => { e.preventDefault(); setResumeDragOver(true); }}
                          onDragLeave={() => setResumeDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setResumeDragOver(false);
                            handleFileChange(e.dataTransfer.files?.[0] ?? null);
                          }}
                          className={[
                            "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer",
                            "py-7 px-4 transition-colors text-center",
                            resumeDragOver
                              ? "border-primary bg-primary/5"
                              : displayErrors.resume
                              ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                              : resumeFile
                              ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5",
                          ].join(" ")}
                        >
                          {resumeFile ? (
                            <>
                              <FileText className="w-8 h-8 text-green-500" />
                              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                {resumeFile.name}
                              </span>
                              <span className="text-xs text-foreground/50">
                                {(resumeFile.size / 1024).toFixed(0)} KB · Click to change
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-foreground/30" />
                              <span className="text-sm font-medium text-foreground/70">
                                Drag & drop or{" "}
                                <span className="text-primary underline underline-offset-2">browse</span>
                              </span>
                              <span id="resume-hint" className="text-xs text-foreground/40">
                                PDF, DOC, DOCX · Max 5 MB
                              </span>
                            </>
                          )}
                        </label>
                      </>
                    )}
                    <span id="err-resume"><FieldError message={displayErrors.resume} /></span>
                  </div>

                  {/* ── Cover Letter ── */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label htmlFor="apply-cover">Cover Letter</Label>
                      <span className="text-xs text-foreground/40">
                        {values.coverLetter.length}/2000
                      </span>
                    </div>
                    <textarea
                      id="apply-cover"
                      name="coverLetter"
                      rows={4}
                      placeholder="Tell the hiring team why you're a great fit…"
                      aria-invalid={!!displayErrors.coverLetter}
                      aria-describedby={displayErrors.coverLetter ? "err-cover" : undefined}
                      maxLength={2000}
                      value={values.coverLetter}
                      onChange={(e) => handleValueChange("coverLetter", e.target.value)}
                      onBlur={() => touch("coverLetter")}
                      className={
                        inputClass(!!displayErrors.coverLetter) +
                        " resize-none leading-relaxed"
                      }
                    />
                    <span id="err-cover"><FieldError message={displayErrors.coverLetter} /></span>
                  </div>

                  {/* ── Required fields note ── */}
                  <p className="text-xs text-foreground/40">
                    Fields marked <span className="text-primary">*</span> are required.
                  </p>

                  {/* ── Submit row ── */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isPending}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-foreground text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
