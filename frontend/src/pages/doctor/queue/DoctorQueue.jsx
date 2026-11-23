import React from 'react';

export default function DoctorQueue() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 8 }}>
        Doctor Queue
      </h1>
      <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Doctor active queue & examination encounter
      </div>
    </div>
  );
}
