import React from 'react';
import { Building2, Clock, Bell, Menu } from 'lucide-react';

export default function Header({
  clinicName = 'Downtown Medical Center',
  suite = '',
  staffName = 'Sarah Jenkins',
  initials = 'SJ',
  currentTime = 'Mon, Oct 28 • 09:42 AM',
  onToggleMenu
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.auth.getCurrentUser()
  // Endpoint: GET /api/v1/auth/me
  // Description: Returns currently authenticated receptionist/doctor profile info
  // ============================================================================

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.clinic.getClinicInfo()
  // Endpoint: GET /api/v1/clinic/details
  // Description: Returns clinic branch name, suite, and system operational hours
  // ============================================================================

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="header-menu-btn"
          onClick={onToggleMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-clinic-info">
          <Building2 size={16} className="header-clinic-icon" />
          <span>
            {clinicName} {suite ? `— ${suite}` : ''}
          </span>
        </div>
        <span style={{ color: 'var(--color-border)' }}>•</span>
        <div className="header-time-info">
          <Clock size={15} />
          <span>{currentTime}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user-profile">
          <div className="user-avatar-circle">{initials}</div>
          <span className="user-name-text">{staffName}</span>
        </div>
        <button
          type="button"
          className="btn-ghost"
          style={{
            padding: 6,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Notifications"
          onClick={() => {
            // BACKEND API INTEGRATION POINT
            // Function: api.notifications.markAllAsSeen()
            // Endpoint: POST /api/v1/notifications/mark-seen
          }}
        >
          <Bell size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
