import React from 'react';
import TimeSlotGrid from './TimeSlotGrid';

export default function DoctorAvailability({
  doctor,
  onSlotClick,
  readOnly = true // Information only for Receptionist (Workflow 2.3)
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.doctors.getDoctorAvailability(doctorId, week)
  // Endpoint: GET /api/v1/doctors/:doctorId/availability?week=${week}
  // Description: Fetches weekly schedule matrix and active status for chosen doctor
  // ============================================================================

  if (!doctor) {
    return (
      <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Select a doctor from the roster to view their availability.
      </div>
    );
  }

  const isPresent = doctor.status?.toLowerCase() === 'present';

  return (
    <div className="card" style={{ padding: '22px 24px', backgroundColor: '#FFFFFF' }}>
      {/* Availability Header (Responsive Flex Wrap) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {doctor.name}
            </h2>
            <span className={`badge ${isPresent ? 'badge-present' : 'badge-absent'}`}>
              {doctor.status}
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {doctor.department} • {doctor.room} • Schedule: {doctor.schedule}
          </div>
        </div>

        {/* Legend & Week Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: 'var(--color-primary-light)',
                  border: '1px solid var(--color-primary-border)'
                }}
              />
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Available</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0'
                }}
              />
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Booked</span>
            </div>
          </div>

          <div
            style={{
              padding: '4px 10px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.05em'
            }}
          >
            {doctor.availability?.week || 'WEEK 44'}
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <TimeSlotGrid
        availability={doctor.availability}
        onSlotClick={onSlotClick}
        readOnly={readOnly}
      />
    </div>
  );
}
