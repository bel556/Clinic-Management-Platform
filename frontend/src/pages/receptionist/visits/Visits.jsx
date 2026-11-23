import React from 'react';

export default function Visits() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 8 }}>
        Today's Visits
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: 20 }}>
        Manage front desk check-in, patient queues, and appointment schedules.
      </p>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Visits module (Person 2 responsibility)
      </div>
    </div>
  );
}
