import { AuthProvider } from '@/frontend/context/AuthContext';
import { ThemeProvider } from '@/frontend/context/ThemeContext';
import Navbar from '@/frontend/components/Navbar';
import '@/frontend/styles/globals.css';

export const metadata = {
  title: 'Happyland Estate',
  description: 'Estate management system for Happyland Estate'
};

// Runs before hydration so the correct theme class is on <html> before first
// paint — avoids a flash of the wrong theme. Kept inline (not next/script)
// because it must execute synchronously, before React ever renders.
const THEME_INIT_SCRIPT = `(function(){try{var stored=localStorage.getItem('happyland_theme');var dark=stored?stored==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(dark)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
