"use client";

import { useActionState, startTransition } from "react";
import { loginAction, ActionState } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

const initialState: ActionState = {
  success: false,
};

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, initialState);

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
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-primary/20">
            D
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-sm text-foreground/60 mt-2">Sign in to manage your job listings or applications</p>
        </div>

        {/* Global Error Banner */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
            {state.error}
          </div>
        )}

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
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                  state.fieldErrors?.email
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-800 focus:ring-primary/20 focus:border-primary"
                } text-foreground placeholder-foreground/30 focus:outline-none focus:ring-4 transition-all duration-200 text-sm`}
                placeholder="you@company.com"
              />
            </div>
            {state.fieldErrors?.email && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40 pointer-events-none">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-950 border ${
                  state.fieldErrors?.password
                    ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
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

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:pointer-events-none"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-foreground/60">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
