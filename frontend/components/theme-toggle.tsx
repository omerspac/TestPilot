'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />;
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer flex items-center justify-center relative group"
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun size={18} className="transition-transform group-hover:rotate-45" />}
      {theme === 'dark' && <Moon size={18} className="transition-transform group-hover:-rotate-12" />}
      {theme === 'system' && <Monitor size={18} />}
      
      <span className="sr-only">Toggle theme</span>
      <span className="absolute -bottom-10 right-0 scale-0 transition-all rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100 whitespace-nowrap z-50">
        Theme: {theme}
      </span>
    </button>
  );
}
