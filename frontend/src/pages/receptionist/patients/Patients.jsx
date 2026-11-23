import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import Button from '../../../components/common/Button';
import PatientSearch from '../../../components/patient/PatientSearch';
import PatientCard from '../../../components/patient/PatientCard';
import { getStoredPatients } from '../../../services/mockData';

export default function Patients() {
  const navigate = useNavigate();

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.getDirectory()
  // Endpoint: GET /api/v1/patients/directory
  // Description: Fetches recently created and recently searched patients for Receptionist
  // ----------------------------------------------------------------------------
  // Function: api.patients.searchPatients({ query })
  // Endpoint: GET /api/v1/patients/search?q=${encodeURIComponent(searchQuery)}
  // Description: Executes server-side search across ID, first/last name, phone number
  // ============================================================================

  const [patients] = useState(getStoredPatients());
  const [searchQuery, setSearchQuery] = useState('');

  // Partition patients into recently created and recently searched for default view (Page 34)
  const recentlyCreated = useMemo(() => {
    return patients.slice(0, 4);
  }, [patients]);

  const recentlySearched = useMemo(() => {
    return patients.slice(4, 6);
  }, [patients]);

  // Filter patients when search is active
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return patients.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const id = p.id.toLowerCase();
      const phone = p.phone.toLowerCase();
      return fullName.includes(q) || id.includes(q) || phone.includes(q);
    });
  }, [patients, searchQuery]);

  const hasNoResults = searchQuery.trim() !== '' && filteredPatients.length === 0;

  const handleAddVisit = (patient) => {
    // Navigates directly to the patient's profile to open the Add Visit workflow
    navigate(`/receptionist/patients/${patient.id}`);
  };

  return (
    <div className="patients-page">
      {/* Top Header Row (Responsive Flex Wrap) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Patients
        </h1>
        <Button
          variant="primary"
          onClick={() => navigate('/receptionist/patients/new')}
          icon={<UserPlus size={16} />}
        >
          + New Patient
        </Button>
      </div>

      {/* Search Bar & Empty State */}
      <PatientSearch
        query={searchQuery}
        onSearchChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        onNewPatient={() => navigate('/receptionist/patients/new')}
        hasNoResults={hasNoResults}
      />

      {/* Active Search Results View */}
      {searchQuery.trim() !== '' && !hasNoResults && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                Search results
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {filteredPatients.length} record{filteredPatients.length !== 1 ? 's' : ''} found
            </span>
          </div>

          <div className="card table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PATIENT ID</th>
                  <th>NAME</th>
                  <th>PHONE</th>
                  <th>DOB / AGE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onAddVisit={handleAddVisit}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Default Directory View (Sprint 1 Page 34) */}
      {!searchQuery.trim() && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginTop: 16 }}>
          {/* Section 1: Recently created */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 6px',
                    borderRadius: 4,
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  NEW
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Recently created
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                4 records today
              </span>
            </div>

            <div className="card table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PATIENT ID</th>
                    <th>NAME</th>
                    <th>PHONE</th>
                    <th>DOB / AGE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlyCreated.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onAddVisit={handleAddVisit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Recently searched */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Recently searched
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Recalled today
              </span>
            </div>

            <div className="card table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PATIENT ID</th>
                    <th>NAME</th>
                    <th>PHONE</th>
                    <th>DOB / AGE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentlySearched.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onAddVisit={handleAddVisit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
