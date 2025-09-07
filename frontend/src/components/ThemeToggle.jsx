import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useDarkMode();
  const isLight = theme === 'light';
  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark theme"
      className={`inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--elev-1)] hover:shadow-[var(--elev-2)] hover:bg-[var(--color-bg-muted)] transition ${className}`}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}


