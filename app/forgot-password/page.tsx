"use client";

import { useActionState, startTransition } from "react";
import { forgotPasswordAction, ActionState } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, Send } from "lucide-react";

const initialState: ActionState = {
  success: false,
};

export default function ForgotPasswordPage() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 relative overflow-hidden bg-background py-12">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-red-400/10 blur-3xl -z-10 animate-pulse delay-75"></div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 relative z-10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
            <Send className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reset Password</h1>
          <p className="text-sm text-foreground/60 mt-2">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        {/* Global Error Banner */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-600 dark:text-red-400">
            {state.error}
          </div>
        )}

        {/* Success Banner */}
        {state.success && state.message ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-center">
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">Check Your Email</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
              {state.message}
            </p>
            <p className="text-xs text-foreground/40 mt-4 leading-relaxed">
              If you don't receive an email within a few minutes, check your spam or junk folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:ring-primary/20 focus:border-primary text-foreground placeholder-foreground/30 focus:outline-none focus:ring-4 transition-all duration-200 text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
