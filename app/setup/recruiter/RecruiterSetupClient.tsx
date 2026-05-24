"use client";

import { useActionState, startTransition, useState } from "react";
import { setupRecruiterAction, ActionState } from "@/app/actions/auth";
import { 
  Building2, Globe, Image as ImageIcon, FileText, 
  Loader2, ArrowRight, CheckCircle2 
} from "lucide-react";

interface SetupProps {
  initialCompanyName: string;
  initialWebsite: string;
  initialLogoUrl: string;
  initialDescription: string;
}

export default function RecruiterSetupClient({
  initialCompanyName,
  initialWebsite,
  initialLogoUrl,
  initialDescription,
}: SetupProps) {
  const [state, action, isPending] = useActionState(setupRecruiterAction, { success: false });

  const [values, setValues] = useState({
    companyName: initialCompanyName,
    website: initialWebsite,
    logoUrl: initialLogoUrl,
    description: initialDescription,
  });

  const handleValueChange = (field: string, val: string) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-950/50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Recruiter Profile Setup</h1>
          <p className="text-sm text-foreground/60 mt-2">
            Complete your company profiles. This information will appear on the jobs you post on Devforge.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 relative z-10">
          {state.error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-650 dark:text-red-400">
              {state.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-foreground/80 mb-2">
                Company Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={values.companyName}
                  onChange={(e) => handleValueChange("companyName", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                    state.fieldErrors?.companyName ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                  placeholder="Acme Corp"
                />
              </div>
              {state.fieldErrors?.companyName && (
                <p className="mt-2 text-xs font-semibold text-red-650 dark:text-red-400">{state.fieldErrors.companyName}</p>
              )}
            </div>

            {/* Company Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-foreground/80 mb-2">
                Company Website URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                  <Globe className="w-4 h-4" />
                </span>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={values.website}
                  onChange={(e) => handleValueChange("website", e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                    state.fieldErrors?.website ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                  placeholder="https://acme.com"
                />
              </div>
              {state.fieldErrors?.website && (
                <p className="mt-2 text-xs font-semibold text-red-650 dark:text-red-400">{state.fieldErrors.website}</p>
              )}
            </div>

            {/* Company Logo URL */}
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-semibold text-foreground/80 mb-2">
                Logo Image URL (Optional)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  value={values.logoUrl}
                  onChange={(e) => handleValueChange("logoUrl", e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all"
                  placeholder="https://acme.com/logo.png"
                />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="text-sm font-semibold text-foreground/80">
                  Company Description
                </label>
                <span className="text-xs text-foreground/40">
                  {values.description.length}/1000
                </span>
              </div>
              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={1000}
                value={values.description}
                onChange={(e) => handleValueChange("description", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all resize-none"
                placeholder="Briefly describe what your company does and what engineers will build..."
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
                  Saving Details...
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
