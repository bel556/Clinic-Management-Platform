import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, X } from 'lucide-react';
import Header from '../components/layout/Header';

export default function DoctorLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const doctorNav = [
    { name: 'Queue', path: '/doctor/queue' },
    { name: 'Visits', path: '/doctor/visits' },
    { name: 'Profile', path: '/doctor/profile' }
  ];

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      <div
        className={`sidebar-overlay ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="logo-badge">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="logo-text">CuraPulse</span>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-title">DOCTOR</div>
        <nav className="sidebar-nav">
          {doctorNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-content-wrapper">
        <Header
          staffName="Dr. Thorne"
          initials="DT"
          onToggleMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
