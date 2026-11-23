import React from 'react';
import SearchBar from '../common/SearchBar';
import Button from '../common/Button';
import { UserPlus } from 'lucide-react';

export default function PatientSearch({
  query = '',
  onSearchChange,
  onClear,
  onNewPatient,
  hasNoResults = false
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.searchPatients({ query })
  // Endpoint: GET /api/v1/patients/search?query=${encodeURIComponent(query)}
  // Description: Debounced search matching patient ID, full name, or phone number
  // ============================================================================

  return (
    <div className="patient-search-section" style={{ marginBottom: 20 }}>
      <SearchBar
        value={query}
        onChange={onSearchChange}
        onClear={onClear}
        placeholder="Search by patient ID, name, or phone..."
      />

      {hasNoResults && query.trim() !== '' && (
        <div style={{ marginTop: 18 }}>
          <div
            className="card"
            style={{
              padding: '28px 24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 6 }}>
              No patients found
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginBottom: 18 }}>
              No patient matches "{query}". Check the spelling, search by phone number, or create a new patient record.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                onClick={onNewPatient}
                icon={<UserPlus size={15} />}
              >
                + New patient
              </Button>
              <Button
                variant="secondary"
                onClick={onClear}
              >
                Clear search
              </Button>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '12px',
              color: 'var(--color-text-muted)'
            }}
          >
            Before creating a record, confirm the patient's phone number to avoid duplicate profiles.
          </div>
        </div>
      )}
    </div>
  );
}
