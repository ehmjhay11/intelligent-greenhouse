import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: '🏠' },
    { href: '/sensors', label: 'Live Sensors', icon: '📊' },
    { href: '/manage-sensors', label: 'Manage Sensors', icon: '⚙️' },
    { href: '/plants', label: 'Plant Management', icon: '🌱' },
    { href: '/alerts', label: 'Alerts', icon: '🚨' },
    { href: '/historical', label: 'Historical Data', icon: '📈' },
    { href: '/reports', label: 'Reports', icon: '📋' }
  ];

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏡 Greenhouse</h2>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="version-info">
              <small>v2.0 - Next.js</small>
            </div>
          </div>
        )}
      </div>
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="main-header">
          <div className="header-content">
            <h1>Intelligent Greenhouse Dashboard</h1>
            <div className="header-actions">
              <div className="status-indicator online">
                <span className="status-dot"></span>
                System Online
              </div>
            </div>
          </div>
        </header>
        
        <main className="page-content">
          {children}
        </main>
        
        <footer className="main-footer">
          <p>&copy; 2024 Intelligent Greenhouse System. Built with Next.js.</p>
        </footer>
      </div>
    </div>
  );
}
