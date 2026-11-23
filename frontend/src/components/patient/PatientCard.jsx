import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';

export default function PatientCard({
  patient,
  onAddVisit,
  isTableRow = true
}) {
  const navigate = useNavigate();

  if (!patient) return null;

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.getPatientSummary(patientId)
  // Endpoint: GET /api/v1/patients/${patient.id}/summary
  // Description: Fetches minimal patient card summary info for fast list rendering
  // ============================================================================

  const formattedDob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '';

  const ageDisplay = patient.age ? ` (${patient.age} yrs)` : '';

  if (isTableRow) {
    return (
      <tr style={{ cursor: 'pointer' }} onClick={() => navigate(`/receptionist/patients/${patient.id}`)}>
        <td style={{ fontWeight: 600, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
          {patient.id}
        </td>
        <td style={{ fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap' }}>
          {patient.firstName} {patient.lastName}
        </td>
        <td style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {patient.phone}
        </td>
        <td style={{ color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
          {formattedDob}{ageDisplay}
        </td>
        <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // BACKEND API INTEGRATION POINT: api.patients.getById(patient.id)
                navigate(`/receptionist/patients/${patient.id}`);
              }}
              style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}
            >
              Detail
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="btn-pill"
              onClick={() => {
                // BACKEND API INTEGRATION POINT: api.visits.createVisitInit(patient.id)
                if (onAddVisit) {
                  onAddVisit(patient);
                } else {
                  navigate(`/receptionist/patients/${patient.id}`);
                }
              }}
              style={{ fontSize: '12px', padding: '3px 12px' }}
            >
              Add Visit
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  // Standalone mobile card fallback format
  return (
    <div
      className="card"
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/receptionist/patients/${patient.id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)' }}>
            {patient.id}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: 2 }}>
            {patient.firstName} {patient.lastName}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {patient.phone}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 1 }}>
            {formattedDob}{ageDisplay}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--color-border-subtle)' }} onClick={(e) => e.stopPropagation()}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/receptionist/patients/${patient.id}`)}
        >
          Detail
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="btn-pill"
          onClick={() => (onAddVisit ? onAddVisit(patient) : navigate(`/receptionist/patients/${patient.id}`))}
        >
          Add Visit
        </Button>
      </div>
    </div>
  );
}
