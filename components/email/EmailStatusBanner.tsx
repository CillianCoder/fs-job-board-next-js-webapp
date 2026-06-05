"use client";

import React from "react";
import { Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ActionState } from "@/app/actions/auth";

interface EmailStatusBannerProps {
  state: ActionState;
  className?: string;
}

/**
 * Centralized banner component for displaying email delivery status.
 * Shows success, warning, or error states based on the server action result.
 */
export default function EmailStatusBanner({
  state,
  className = "",
}: EmailStatusBannerProps) {
  if (!state.success && !state.message && !state.error) {
    return null;
  }

  // Error state
  if (state.error) {
    return (
      <div
        className={`p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-start gap-3 ${className}`}>
        <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>{state.error}</div>
      </div>
    );
  }

  // Success state with message
  if (state.success && state.message) {
    // Detect if this is a warning/caution message (contains "attempted" or "limited")
    const isWarning =
      state.message.toLowerCase().includes("attempted") ||
      state.message.toLowerCase().includes("limited") ||
      state.message.toLowerCase().includes("may");

    if (isWarning) {
      return (
        <div
          className={`p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl text-sm text-amber-700 dark:text-amber-300 ${className}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Delivery may be limited</p>
              <p>{state.message}</p>
            </div>
          </div>
        </div>
      );
    }

    // Standard success message
    return (
      <div
        className={`p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-emerald-700 dark:text-emerald-300 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Success</p>
            <p className="text-sm">{state.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
