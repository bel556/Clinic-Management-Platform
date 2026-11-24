import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PatientDetails from '../../../components/patient/PatientDetails';
import PatientHistory from '../../../components/patient/PatientHistory';
import PatientForm from '../../../components/patient/PatientForm';
import Button from '../../../components/common/Button';
import {
  getPatientById,
  updatePatient,
  createVisit,
  updateVisit,
  deleteVisit
} from '../../../services/mockData';

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoOpenAddVisit = searchParams.get('addVisit') === 'true';

  const [patient, setPatient] = useState(null);
  const [viewMode, setViewMode] = useState('details'); // 'details' | 'history' | 'edit'

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.getPatientById(patientId)
  // Endpoint: GET /api/v1/patients/${id}
  // Description: Fetches comprehensive patient profile and visit history
  // ----------------------------------------------------------------------------
  // Function: api.patients.updatePatient(patientId, updatedData)
  // Endpoint: PUT /api/v1/patients/${id}
  // Description: Persists updated patient demographics
  // ----------------------------------------------------------------------------
  // Function: api.visits.createVisit(newVisitPayload)
  // Endpoint: POST /api/v1/visits
  // Description: Schedules a new visit linked to this patient
  // ----------------------------------------------------------------------------
  // Function: api.visits.modifyVisit(visitId, modifiedPayload)
  // Endpoint: PUT /api/v1/visits/:visitId
  // Description: Modifies an existing visit date, time, doctor, status or reason
  // ----------------------------------------------------------------------------
  // Function: api.visits.deleteVisit(visitId)
  // Endpoint: DELETE /api/v1/visits/:visitId
  // Description: Cancels and removes visit from schedule
  // ============================================================================

  const refreshPatient = () => {
    if (id) {
      const found = getPatientById(id);
      setPatient(found ? { ...found } : null);
    }
  };

  useEffect(() => {
    refreshPatient();
    window.addEventListener('curapulse_visits_updated', refreshPatient);
    return () => window.removeEventListener('curapulse_visits_updated', refreshPatient);
  }, [id]);

  if (!patient) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: 8 }}>
          Patient Not Found
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13.5px', marginBottom: 20 }}>
          Could not find patient record for ID: {id}
        </p>
        <Button variant="primary" onClick={() => navigate('/receptionist/patients')}>
          Return to Patients Directory
        </Button>
      </div>
    );
  }

  const handleUpdate = (updatedData) => {
    // BACKEND API INTEGRATION: api.patients.updatePatient(patient.id, updatedData)
    const updated = updatePatient(patient.id, updatedData);
    setPatient(updated ? { ...updated } : null);
    setViewMode('details');
  };

  const handleAddVisitComplete = (newVisit) => {
    // BACKEND API INTEGRATION: api.visits.createVisit(newVisit)
    createVisit({
      ...newVisit,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    });
    refreshPatient();
  };

  const handleModifyVisit = (modifiedVisit) => {
    // BACKEND API INTEGRATION: api.visits.modifyVisit(modifiedVisit.id, modifiedVisit)
    updateVisit(modifiedVisit.id, modifiedVisit);
    refreshPatient();
  };

  const handleDeleteVisit = (visitId) => {
    // BACKEND API INTEGRATION: api.visits.deleteVisit(visitId)
    deleteVisit(visitId);
    refreshPatient();
  };

  return (
    <div>
      {viewMode === 'details' && (
        <PatientDetails
          patient={patient}
          onBack={() => navigate('/receptionist/patients')}
          onEdit={() => setViewMode('edit')}
          onViewTimeline={() => setViewMode('history')}
          onAddVisitComplete={handleAddVisitComplete}
          onModifyVisit={handleModifyVisit}
          onDeleteVisit={handleDeleteVisit}
          autoOpenAddVisit={autoOpenAddVisit}
        />
      )}

      {viewMode === 'history' && (
        <PatientHistory
          patient={patient}
          onBack={() => setViewMode('details')}
          onNewAppointment={() => setViewMode('details')}
        />
      )}

      {viewMode === 'edit' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Patients / {patient.firstName} {patient.lastName} / Edit information
            </span>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
              Edit patient information
            </h1>
          </div>
          <PatientForm
            initialData={patient}
            isEdit={true}
            onSubmit={handleUpdate}
            onCancel={() => setViewMode('details')}
          />
        </div>
      )}
    </div>
  );
}
