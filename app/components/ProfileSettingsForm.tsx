"use client";

import { useActionState, startTransition, useState, useEffect } from "react";
import { changePasswordAction, ActionState } from "@/app/actions/settings";
import { Lock, Loader2, Check } from "lucide-react";

export default function ProfileSettingsForm() {
  const [state, action, isPending] = useActionState(changePasswordAction, { success: false });

  const [values, setValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleValueChange = (field: string, val: string) => {
    setValues((prev) => ({ ...prev, [field]: val }));
  };

  // Clear form on successful password change
  useEffect(() => {
    if (state.success) {
      setValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
  }, [state.success]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Lock className="w-4 h-4" />
          </div>
          Account Settings
        </h2>
        <p className="text-sm text-foreground/60 mt-1">Change your password</p>
      </div>

      {state.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-650 dark:text-red-400">
          {state.error}
        </div>
      )}

      {state.success && state.message && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30 rounded-xl text-sm text-green-650 dark:text-green-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-semibold text-foreground/80 mb-2">
            Current Password <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="oldPassword"
              name="oldPassword"
              type="password"
              required
              value={values.oldPassword}
              onChange={(e) => handleValueChange("oldPassword", e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                state.fieldErrors?.oldPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
              } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
              placeholder="Enter your current password"
              disabled={isPending}
            />
          </div>
          {state.fieldErrors?.oldPassword && (
            <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.oldPassword}</p>
          )}
        </div>

        {/* New Password & Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-foreground/80 mb-2">
              New Password <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={values.newPassword}
                onChange={(e) => handleValueChange("newPassword", e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                  state.fieldErrors?.newPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                placeholder="Enter new password"
                disabled={isPending}
              />
            </div>
            {state.fieldErrors?.newPassword && (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground/80 mb-2">
              Confirm New Password <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={values.confirmPassword}
                onChange={(e) => handleValueChange("confirmPassword", e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                  state.fieldErrors?.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } text-foreground text-sm focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all`}
                placeholder="Re-enter new password"
                disabled={isPending}
              />
            </div>
            {state.fieldErrors?.confirmPassword && (
              <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{state.fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
