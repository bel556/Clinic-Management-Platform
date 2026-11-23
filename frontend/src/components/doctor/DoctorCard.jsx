import React from 'react';

export default function DoctorCard({
  doctor,
  isSelected = false,
  onClick
}) {
  if (!doctor) return null;

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.doctors.getDoctorTelemetry(doctorId)
  // Endpoint: GET /api/v1/doctors/${doctor.id}/telemetry
  // Description: Real-time telemetry (presence, active queue count, exam room)
  // ============================================================================

  const isPresent = doctor.status?.toLowerCase() === 'present';

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        backgroundColor: '#FFFFFF',
        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : 'none'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
            {doctor.name}
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isPresent ? 'var(--color-success)' : 'var(--color-text-subtle)'
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>
          {doctor.specialty} • {doctor.suite || doctor.room}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div>
          <span className={`badge ${isPresent ? 'badge-present' : 'badge-absent'}`}>
            {doctor.status}
          </span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 4, fontWeight: 500 }}>
          {doctor.statusNote || (isPresent ? `${doctor.queueCount || 0} in queue` : 'Off roster')}
        </div>
      </div>
    </div>
  );
}
