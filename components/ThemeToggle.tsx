import React, { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'theme';

export const ThemeToggle: React.FC<{ className?: string }>
  = ({ className = '' }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(THEME_KEY)) as Theme | null;
    return saved || 'system';
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (t: Theme) => {
      if (t === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        // system
        if (mql.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    apply(theme);

    const onChange = () => theme === 'system' && apply('system');
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="theme" className="text-sm text-gray-600 dark:text-gray-300">Theme</label>
      <select
        id="theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-white text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Theme selector"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
