import React, { useState, useMemo } from 'react';
import { Lock, Radio, UserCheck, Calendar } from 'lucide-react';
import DoctorCard from '../../../components/doctor/DoctorCard';
import DoctorAvailability from '../../../components/doctor/DoctorAvailability';
import SearchBar from '../../../components/common/SearchBar';
import { getStoredDoctors } from '../../../services/mockData';

export default function Doctors() {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.doctors.getAttendingDoctors()
  // Endpoint: GET /api/v1/doctors/attending
  // Description: Fetches list of all active doctors with room & live queue counts
  // ----------------------------------------------------------------------------
  // Function: api.doctors.syncRosterTelemetry()
  // Endpoint: GET /api/v1/doctors/telemetry/stream (or polling every 10s)
  // Description: Real-time telemetry sync for active doctor statuses
  // ============================================================================

  const [doctors] = useState(getStoredDoctors());
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'availability' for small screens

  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    const q = searchQuery.toLowerCase();
    return doctors.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
    );
  }, [doctors, searchQuery]);

  const selectedDoctor = useMemo(() => {
    return doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  }, [doctors, selectedDoctorId]);

  const handleSelectDoctor = (id) => {
    setSelectedDoctorId(id);
    // On mobile screens, automatically show availability tab when a doctor is tapped
    if (window.innerWidth <= 768) {
      setMobileTab('availability');
    }
  };

  return (
    <div className="doctors-page">
      {/* Top Header Row (Responsive Flex Wrap) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Doctors
        </h1>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search doctor name or specialty..."
          />
        </div>
      </div>

      {/* Mobile Tab Switcher (< 768px viewports) */}
      <div
        className="mobile-tab-bar"
        style={{
          display: 'none',
          gap: 8,
          marginBottom: 16
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('list')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: mobileTab === 'list' ? 'var(--color-primary)' : 'var(--color-bg-muted)',
            color: mobileTab === 'list' ? '#FFFFFF' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <UserCheck size={15} />
          Attending Roster ({filteredDoctors.length})
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('availability')}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: mobileTab === 'availability' ? 'var(--color-primary)' : 'var(--color-bg-muted)',
            color: mobileTab === 'availability' ? '#FFFFFF' : 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <Calendar size={15} />
          Availability Schedule
        </button>
      </div>

      {/* Main 2-Column Responsive Layout (Sprint 1 Page 32) */}
      <div className="doctors-layout-grid">
        {/* Left Column: Attending Physicians */}
        <div
          className={`doctors-list-col ${mobileTab === 'availability' ? 'mobile-hidden' : ''}`}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 4px'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              ATTENDING PHYSICIANS ({filteredDoctors.length})
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--color-primary)'
              }}
            >
              <Radio size={12} />
              Live telemetry
            </span>
          </div>

          {/* Doctors Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                isSelected={doc.id === selectedDoctorId}
                onClick={() => handleSelectDoctor(doc.id)}
              />
            ))}

            {filteredDoctors.length === 0 && (
              <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No doctors matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Roster Mode Status Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginTop: 10,
              fontSize: '11px',
              color: 'var(--color-text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={13} />
              <span>Roster mode: Receptionist (Read-Only)</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Sync 10s</span>
          </div>
        </div>

        {/* Right Column: Doctor Availability Grid */}
        <div className={`doctors-availability-col ${mobileTab === 'list' ? 'mobile-hidden' : ''}`}>
          <DoctorAvailability
            doctor={selectedDoctor}
            readOnly={true} // As specified: "information only, no editing" for Receptionist
          />
        </div>
      </div>
    </div>
  );
}
