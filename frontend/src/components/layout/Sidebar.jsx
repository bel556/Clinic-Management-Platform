import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, X } from 'lucide-react';

export default function Sidebar({ isMobileOpen = false, onClose }) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.notifications.getUnreadCount()
  // Endpoint: GET /api/v1/notifications/unread-count
  // Description: Fetches the live counter of unread notifications for reception badge
  // ============================================================================
  const unreadNotificationCount = 3;

  const navItems = [
    { name: 'Patients', path: '/receptionist/patients' },
    { name: 'Visits', path: '/receptionist/visits' },
    { name: 'Doctors', path: '/receptionist/doctors' },
    { name: 'Notifications', path: '/receptionist/notifications', badge: unreadNotificationCount },
    { name: 'Profile', path: '/receptionist/profile' }
  ];

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo-area">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-badge">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <span className="logo-text">CuraPulse</span>
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Section */}
      <div className="sidebar-section-title">RECEPTION</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span>{item.name}</span>
            {item.badge !== undefined && (
              <span className="sidebar-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
