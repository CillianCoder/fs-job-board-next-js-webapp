"use client";

import { useActionState, startTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction, ActionState } from "@/app/actions/auth";
import Link from "next/link";
import { Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

const initialState: ActionState = {
  success: false,
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, action, isPending] = useActionState(resetPasswordAction, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    startTransition(() => {
      action(formData);
    });
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <h3 className="text-lg font-bold text-red-650 dark:text-red-400 mb-2">Invalid Reset Link</h3>
        <p className="text-sm text-foreground/60 leading-relaxed mb-6">
          This password reset link is missing a validation token or is invalid.
        </p>
        <Link 
          href="/forgot-password" 
          className="text-sm font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (state.success && state.message) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Success!</h3>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed mb-6">
          {state.message}
        </p>
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all duration-200"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Global Error Banner */}
      {state.error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-foreground/80 mb-2">
          New Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
            <Lock className="w-5 h-5" />
          </span>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
              state.fieldErrors?.password
                ? "border-red-500 focus:ring-red-500/20"
                : "border-gray-200 dark:border-gray-800 focus:ring-primary/20 focus:border-primary"
            } text-foreground placeholder-foreground/30 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
            placeholder="••••••••"
          />
        </div>
        {state.fieldErrors?.password && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {state.fieldErrors.password}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground/80 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
            <Lock className="w-5 h-5" />
          </span>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
              state.fieldErrors?.confirmPassword
                ? "border-red-500 focus:ring-red-500/20"
                : "border-gray-200 dark:border-gray-800 focus:ring-primary/20 focus:border-primary"
            } text-foreground placeholder-foreground/30 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
            placeholder="••••••••"
          />
        </div>
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating password...
          </>
        ) : (
          <>
            Reset Password
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 relative overflow-hidden bg-background py-12">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-red-400/10 blur-3xl -z-10 animate-pulse delay-75"></div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 relative z-10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Set New Password</h1>
          <p className="text-sm text-foreground/60 mt-2">
            Create a secure new password for your Devforge account
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
