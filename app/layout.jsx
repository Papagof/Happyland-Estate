import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import './globals.css';

export const metadata = {
  title: 'Happyland Estate',
  description: 'Estate management system for Happyland Estate'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
