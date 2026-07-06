'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, Users, CreditCard, Info, Building, MapPin, LogIn, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/residents', label: 'Residents & Landlords', icon: Users, restricted: true },
  { href: '/payment', label: 'Service Charge', icon: CreditCard },
  { href: '/about', label: 'About Estate', icon: Info },
  { href: '/executives', label: 'Management', icon: Building, restricted: true },
  { href: '/properties', label: 'Properties', icon: MapPin },
  { href: '/users', label: 'User Accounts', icon: UserCog, adminOnly: true }
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(item => {
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
    `${styles.navbarLink} ${pathname === href ? styles.active : ''}`;

  const navButtons = (
    <>
      {visibleItems.map(item => {
        const Icon = item.icon;
        return (
          <button key={item.href} className={linkClass(item.href)} onClick={() => navigate(item.href)}>
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
      {isAuthenticated ? (
        <button className={styles.navbarLink} onClick={handleLogout}>
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
    <header className={styles.navbar}>
      <div className={styles.navbarInner}>
        <div className={styles.navbarBrand}>
          <div className={styles.navbarLogo}>🏘️</div>
          HAPPYLAND ESTATE
        </div>
        <nav className={styles.navbarLinks}>{navButtons}</nav>
        <button className={styles.navbarToggle} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <nav className={`${styles.navbarMobileLinks} ${menuOpen ? styles.open : ''}`}>
        {navButtons}
      </nav>
    </header>
  );
}
