import { useState } from 'react';
import { Menu, X, Home, Users, CreditCard, Info, Building, MapPin, LogIn, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'residents', label: 'Residents & Landlords', icon: Users, restricted: true },
  { id: 'payment', label: 'Service Charge', icon: CreditCard },
  { id: 'about', label: 'About Estate', icon: Info },
  { id: 'executives', label: 'Management', icon: Building, restricted: true },
  { id: 'properties', label: 'Properties', icon: MapPin },
  { id: 'users', label: 'User Accounts', icon: UserCog, adminOnly: true }
];

export default function Navbar({ currentPage, setCurrentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly) return user?.role === 'admin';
    return !item.restricted || isAuthenticated;
  });

  const navigate = (id) => {
    setCurrentPage(id);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">🏘️</div>
          HAPPYLAND ESTATE
        </div>

        <nav className="navbar-links">
          {visibleItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`navbar-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
          {isAuthenticated ? (
            <button className="navbar-link" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <button className={`navbar-link ${currentPage === 'login' ? 'active' : ''}`} onClick={() => navigate('login')}>
              <LogIn size={16} /> Login
            </button>
          )}
        </nav>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className={`navbar-mobile-links ${menuOpen ? 'open' : ''}`}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`navbar-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
        {isAuthenticated ? (
          <button className="navbar-link" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <button className={`navbar-link ${currentPage === 'login' ? 'active' : ''}`} onClick={() => navigate('login')}>
            <LogIn size={16} /> Login
          </button>
        )}
      </nav>
    </header>
  );
}
