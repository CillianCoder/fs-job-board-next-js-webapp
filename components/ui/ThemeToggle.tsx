"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        relative flex items-center w-14 h-7 rounded-full p-0.5 cursor-pointer
        transition-colors duration-300 ease-in-out focus:outline-none
        focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${isDark
          ? "bg-primary/90"
          : "bg-gray-200 dark:bg-gray-700"
        }
      `}
    >
      {/* Sliding knob */}
      <span
        className={`
          absolute flex items-center justify-center
          w-6 h-6 rounded-full shadow-sm
          transition-all duration-300 ease-in-out
          ${isDark
            ? "translate-x-7 bg-white"
            : "translate-x-0 bg-white"
          }
        `}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />
        )}
      </span>

      {/* Track icons (subtle background indicators) */}
      <span className="absolute left-1.5 opacity-60">
        {isDark && <Sun className="w-3 h-3 text-white/50" />}
      </span>
      <span className="absolute right-1.5 opacity-60">
        {!isDark && <Moon className="w-3 h-3 text-gray-400" />}
      </span>
    </button>
  );
}
