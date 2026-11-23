import React, { useState } from 'react';
import Button from '../common/Button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function PatientHistory({
  patient,
  onBack,
  onNewAppointment
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.getPatientClinicalNotes(patientId)
  // Endpoint: GET /api/v1/patients/${patient.id}/clinical-notes
  // Description: Returns all recorded notes across all attending doctors
  // ----------------------------------------------------------------------------
  // Function: api.patients.getPatientVisitHistory(patientId)
  // Endpoint: GET /api/v1/patients/${patient.id}/history
  // Description: Returns all historical encounters and outcomes
  // ============================================================================

  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' | 'visits'

  if (!patient) return null;

  const notes = patient.clinicalNotes || [];
  const visits = patient.recentVisits || [];

  return (
    <div className="patient-history-view" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Title */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 16 }}>
        Patient history & notes
      </h2>

      {/* Patient Banner */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 16,
          backgroundColor: '#FFFFFF'
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          {patient.firstName} {patient.lastName}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
          {patient.id} • {patient.dateOfBirth} • {patient.phone}
        </div>
        <div
          style={{
            marginTop: 12,
            padding: '10px 14px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            color: 'var(--color-text-secondary)'
          }}
        >
          Full patient history · Notes from all doctors are visible here.
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab('clinical')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'clinical' ? 'var(--color-primary)' : '#E2E8F0',
            color: activeTab === 'clinical' ? '#FFFFFF' : 'var(--color-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          Clinical notes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('visits')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: activeTab === 'visits' ? 'var(--color-primary)' : '#E2E8F0',
            color: activeTab === 'visits' ? '#FFFFFF' : 'var(--color-text-secondary)',
            transition: 'all 0.15s ease'
          }}
        >
          Visit history
        </button>
      </div>

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {activeTab === 'clinical' ? (
          notes.length > 0 ? (
            notes.map((item, idx) => (
              <div
                key={item.id || idx}
                className="card"
                style={{ padding: '16px 20px', backgroundColor: '#FFFFFF' }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  {item.date} · {item.doctor} · {item.specialty}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-badge-blue)',
                    marginTop: 3,
                    marginBottom: 8
                  }}
                >
                  {item.visitId} · {item.type} · {item.status}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {item.note}
                </p>
              </div>
            ))
          ) : (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No clinical notes recorded yet.
            </div>
          )
        ) : (
          visits.length > 0 ? (
            visits.map((v, idx) => (
              <div
                key={v.id || idx}
                className="card"
                style={{ padding: '16px 20px', backgroundColor: '#FFFFFF' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {v.dateTime}
                  </div>
                  <span className={`badge ${v.status === 'Scheduled' ? 'badge-scheduled' : 'badge-completed'}`}>
                    • {v.status}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginTop: 4 }}>
                  {v.physician}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Reason: {v.reason}
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No visit history recorded yet.
            </div>
          )
        )}
      </div>

      {/* Footer Navigation Buttons (Responsive wrap) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Button
          variant="secondary"
          onClick={onBack}
          icon={<ArrowLeft size={15} />}
        >
          Back to patient details
        </Button>
        <Button
          variant="primary"
          onClick={onNewAppointment}
          icon={<Plus size={15} />}
        >
          Assign follow-up appointment
        </Button>
      </div>
    </div>
  );
}
