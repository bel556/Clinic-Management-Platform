import React from 'react';

export default function TimeSlotGrid({
  availability,
  onSlotClick,
  readOnly = true // As specified in 2.3: "information only, no editing" for Receptionist
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.doctors.getTimeSlotGrid(doctorId, weekNumber)
  // Endpoint: GET /api/v1/doctors/:doctorId/schedule?week=${weekNumber}
  // Description: Returns weekly grid of available and booked timeslots
  // ----------------------------------------------------------------------------
  // Function: api.doctors.updateTimeSlot(doctorId, dayKey, time, status)
  // Endpoint: PATCH /api/v1/doctors/:doctorId/schedule/slot
  // Description: Updates single timeslot status (Authorized for Doctor profile)
  // ============================================================================

  if (!availability || !availability.days || !availability.timeSlots) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No schedule data available.
      </div>
    );
  }

  const { days, timeSlots } = availability;

  return (
    <div className="table-responsive" style={{ width: '100%' }}>
      <table
        className="data-table"
        style={{
          borderCollapse: 'separate',
          borderSpacing: '0 6px',
          width: '100%',
          minWidth: '580px'
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '90px', backgroundColor: 'transparent', borderBottom: 'none' }}>
              TIME
            </th>
            {days.map((day) => (
              <th
                key={day.key}
                style={{
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  borderBottom: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.04em'
                }}
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((ts, rowIdx) => {
            if (ts.isRecess) {
              return (
                <tr key={`recess-${rowIdx}`}>
                  <td
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      padding: '8px 12px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {ts.time}
                  </td>
                  <td
                    colSpan={days.length}
                    style={{
                      textAlign: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)',
                      letterSpacing: '0.08em'
                    }}
                  >
                    {ts.label || 'CLINICAL RECESS / ROUNDS'}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={ts.time}>
                <td
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'nowrap',
                    padding: '6px 12px'
                  }}
                >
                  {ts.time}
                </td>
                {days.map((day) => {
                  const status = ts.slots?.[day.key] || 'Booked';
                  const isAvailable = status === 'Available';

                  return (
                    <td
                      key={day.key}
                      style={{
                        textAlign: 'center',
                        padding: '4px 6px'
                      }}
                    >
                      <button
                        type="button"
                        disabled={readOnly}
                        onClick={() => onSlotClick?.(day.key, ts.time, status)}
                        style={{
                          width: '100%',
                          minWidth: '78px',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: readOnly ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          border: isAvailable
                            ? '1px solid var(--color-primary-border)'
                            : '1px solid #E2E8F0',
                          backgroundColor: isAvailable
                            ? 'var(--color-primary-light)'
                            : '#F1F5F9',
                          color: isAvailable
                            ? 'var(--color-primary)'
                            : 'var(--color-text-muted)'
                        }}
                      >
                        {status}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
