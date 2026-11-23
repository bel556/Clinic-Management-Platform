import React from 'react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../../../components/patient/PatientForm';
import { addPatient } from '../../../services/mockData';

export default function NewPatientPage() {
  const navigate = useNavigate();

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.createPatient(patientData)
  // Endpoint: POST /api/v1/patients
  // Description: Registers a new patient, generates patient ID, and commits to database
  // ============================================================================

  const handleCreate = (formData) => {
    const created = addPatient(formData);
    navigate(`/receptionist/patients/${created.id}`);
  };

  return (
    <div className="new-patient-page">
      <div style={{ maxWidth: 760, margin: '0 auto 16px', width: '100%' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Patients / Register a new patient
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
          New patient
        </h1>
      </div>

      <PatientForm
        onSubmit={handleCreate}
        onCancel={() => navigate('/receptionist/patients')}
      />
    </div>
  );
}
