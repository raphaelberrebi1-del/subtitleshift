import { useEffect, useState } from 'react';

export function useDarkMode() {
  // Initialize from localStorage or system preference
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Save to localStorage
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle };
}
