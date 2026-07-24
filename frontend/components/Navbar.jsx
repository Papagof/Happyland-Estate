'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, Users, CreditCard, Info, Building, MapPin, Mail, LogIn, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/frontend/context/useAuth';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/residents', label: 'Residents & Landlords', icon: Users, restricted: true },
  { href: '/payment', label: 'Service Charge', icon: CreditCard },
  { href: '/about', label: 'About Estate', icon: Info },
  { href: '/executives', label: 'Management', icon: Building },
  { href: '/properties', label: 'Properties', icon: MapPin },
  { href: '/contact', label: 'Contact', icon: Mail },
  { href: '/users', label: 'User Accounts', icon: UserCog, adminOnly: true }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return user?.role === 'admin';
    return !item.restricted || isAuthenticated;
  });

  const navigate = (href) => {
    router.push(href);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setMenuOpen(false);
  };

  const linkClass = (href) =>
    `flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
      pathname === href
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  const navButtons = (
    <>
      {visibleItems.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.href} className={linkClass(item.href)} onClick={() => navigate(item.href)}>
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
      {isAuthenticated ? (
        <button
          className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          onClick={handleLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      ) : (
        <button className={linkClass('/login')} onClick={() => navigate('/login')}>
          <LogIn size={16} /> Login
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <div className="flex items-center gap-2.5 text-base font-bold tracking-tight text-indigo-900 dark:text-indigo-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-lg">🏘️</div>
          <span className="hidden sm:inline">HAPPYLAND ESTATE</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-indigo-900 hover:bg-slate-100 dark:text-indigo-200 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <nav className="mx-auto hidden max-w-6xl flex-wrap items-center justify-center gap-1 px-5 pb-3 lg:flex">{navButtons}</nav>

      <nav
        className={`grid gap-1 overflow-hidden border-t border-slate-200/80 px-5 transition-[grid-template-rows,opacity] duration-300 dark:border-slate-800/80 lg:hidden ${
          menuOpen ? 'grid-rows-[1fr] py-3 opacity-100' : 'grid-rows-[0fr] py-0 opacity-0'
        }`}
      >
        <div className="flex min-h-0 flex-col gap-1">
          {navButtons}
          <div className="mt-2 flex items-center justify-between rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Appearance
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
