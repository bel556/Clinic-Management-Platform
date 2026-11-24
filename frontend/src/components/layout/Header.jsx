import React, { useState, useEffect } from 'react';
import { Building2, Clock, Bell, Menu, Globe, ChevronDown } from 'lucide-react';
import {
  SUPPORTED_REGIONS,
  getSelectedTimezone,
  setSelectedTimezone,
  formatHeaderDateTime
} from '../../utils/dateTime';

export default function Header({
  clinicName = 'Downtown Medical Center',
  suite = '',
  staffName = 'Sarah Jenkins',
  initials = 'SJ',
  onToggleMenu
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.clinic.getClinicTimezone()
  // Endpoint: GET /api/v1/clinic/settings/timezone
  // Description: Returns configured timezone (defaults to Africa/Algiers)
  // ----------------------------------------------------------------------------
  // Function: api.clinic.setClinicTimezone(timezoneId)
  // Endpoint: PATCH /api/v1/clinic/settings/timezone
  // Description: Updates clinic operational region and active timezone
  // ----------------------------------------------------------------------------
  // Function: api.auth.getCurrentUser()
  // Endpoint: GET /api/v1/auth/me
  // Description: Returns current receptionist session profile
  // ============================================================================

  const [activeTimezone, setActiveTimezone] = useState(getSelectedTimezone());
  const [currentTimeStr, setCurrentTimeStr] = useState(formatHeaderDateTime(new Date(), activeTimezone));
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);

  // Live ticking clock (updates every 1000ms in real time)
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(formatHeaderDateTime(new Date(), activeTimezone));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeTimezone]);

  // Listen to global timezone changes
  useEffect(() => {
    const handleTimezoneChange = (e) => {
      setActiveTimezone(e.detail || getSelectedTimezone());
    };
    window.addEventListener('curapulse_timezone_changed', handleTimezoneChange);
    return () => window.removeEventListener('curapulse_timezone_changed', handleTimezoneChange);
  }, []);

  const handleSelectRegion = (tzId) => {
    // BACKEND API INTEGRATION POINT: api.clinic.setClinicTimezone(tzId)
    setSelectedTimezone(tzId);
    setActiveTimezone(tzId);
    setShowTimezoneDropdown(false);
  };

  const currentRegionObj = SUPPORTED_REGIONS.find((r) => r.id === activeTimezone) || SUPPORTED_REGIONS[0];

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

        {/* Clinic Name */}
        <div className="header-clinic-info">
          <Building2 size={16} className="header-clinic-icon" />
          <span>
            {clinicName} {suite ? `— ${suite}` : ''}
          </span>
        </div>

        <span style={{ color: 'var(--color-border)' }}>•</span>

        {/* Live Clock according to selected region */}
        <div className="header-time-info" title={`Live clinic time (${currentRegionObj.name})`}>
          <Clock size={15} />
          <span>{currentTimeStr}</span>
        </div>

        {/* Region & Timezone Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowTimezoneDropdown((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-border)',
              backgroundColor: '#F8FAFC',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Change clinic operational region & timezone"
          >
            <span>{currentRegionObj.flag}</span>
            <span>{currentRegionObj.offset}</span>
            <ChevronDown size={12} />
          </button>

          {showTimezoneDropdown && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                onClick={() => setShowTimezoneDropdown(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '230px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  zIndex: 120,
                  padding: '6px 0',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                <div
                  style={{
                    padding: '6px 12px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-subtle)',
                    borderBottom: '1px solid var(--color-border-subtle)'
                  }}
                >
                  Clinic Region & Timezone
                </div>
                {SUPPORTED_REGIONS.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleSelectRegion(reg.id)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      background: reg.id === activeTimezone ? 'var(--color-primary-light)' : 'transparent',
                      color: reg.id === activeTimezone ? 'var(--color-primary)' : 'var(--color-text-main)',
                      fontSize: '12px',
                      fontWeight: reg.id === activeTimezone ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>
                      {reg.flag} {reg.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{reg.offset}</span>
                  </button>
                ))}
              </div>
            </>
          )}
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
        >
          <Bell size={16} style={{ color: 'var(--color-text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
