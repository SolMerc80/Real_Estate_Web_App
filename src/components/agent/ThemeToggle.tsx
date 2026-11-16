"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-neutral-200/80 dark:border-slate-700" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-neutral-200/80 dark:border-slate-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-slate-700 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#135446]/20"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300" />
      ) : (
        <Sun className="h-4.5 w-4.5 text-neutral-600 dark:text-neutral-300 transition-transform duration-300" />
      )}
    </button>
  );
}

