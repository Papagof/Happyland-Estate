import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResidentsPage from './pages/ResidentsPage';
import PaymentPage from './pages/PaymentPage';
import AboutPage from './pages/AboutPage';
import ExecutivesPage from './pages/ExecutivesPage';
import PropertiesPage from './pages/PropertiesPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { residentsApi, executivesApi, propertiesApi } from './api/client';

const RESTRICTED_PAGES = ['residents', 'executives'];

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [residents, setResidents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [residentCount, setResidentCount] = useState(0);
  const [activeExecutiveCount, setActiveExecutiveCount] = useState(0);

  useEffect(() => {
    propertiesApi.list().then(setProperties);
    residentsApi.count().then(({ count }) => setResidentCount(count));
    executivesApi.activeCount().then(({ count }) => setActiveExecutiveCount(count));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    residentsApi.list().then(setResidents);
    executivesApi.list().then(setExecutives);
  }, [isAuthenticated]);

  const restricted = RESTRICTED_PAGES.includes(currentPage) && !isAuthenticated;
  const homeResidentCount = isAuthenticated ? residents.length : residentCount;
  const homeActiveExecutiveCount = isAuthenticated ? executives.filter(e => e.isActive).length : activeExecutiveCount;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {currentPage === 'home' && <HomePage residentCount={homeResidentCount} properties={properties} activeExecutiveCount={homeActiveExecutiveCount} />}
      {currentPage === 'residents' && (restricted ? <LoginPage /> : <ResidentsPage residents={residents} setResidents={setResidents} />)}
      {currentPage === 'payment' && <PaymentPage />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'executives' && (restricted ? <LoginPage /> : <ExecutivesPage executives={executives} setExecutives={setExecutives} />)}
      {currentPage === 'properties' && <PropertiesPage properties={properties} setProperties={setProperties} />}
      {currentPage === 'login' && !isAuthenticated && <LoginPage onSuccess={() => setCurrentPage('home')} />}
      {currentPage === 'users' && (
        !isAuthenticated ? <LoginPage /> :
        user.role !== 'admin' ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94A3B8' }}>
            Admins only.
          </div>
        ) : <UsersPage />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
