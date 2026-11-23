import React from 'react';

export default function DoctorVisits() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 8 }}>
        My Visits & Calendar
      </h1>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Doctor visits schedule & affected appointments
      </div>
    </div>
  );
}
