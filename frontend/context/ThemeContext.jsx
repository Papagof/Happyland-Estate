'use client';

import { useEffect, useState } from 'react';
import { ThemeContext } from './theme-context';

const THEME_KEY = 'happyland_theme';

export function ThemeProvider({ children }) {
  // The inline script in app/layout.jsx already sets the "dark" class on
  // <html> before hydration, so read it back rather than guessing again.
  const [theme, setTheme] = useState(() => {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
