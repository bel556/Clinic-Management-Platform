import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DoctorAvailability from '../../../components/doctor/DoctorAvailability';
import { getDoctorById } from '../../../services/mockData';

export default function DoctorAvailabilityPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.doctors.getDoctorById(doctorId)
  // Endpoint: GET /api/v1/doctors/:doctorId
  // Description: Fetches doctor information, clinic space, and current status
  // ----------------------------------------------------------------------------
  // Function: api.doctors.getDoctorAvailability(doctorId, week)
  // Endpoint: GET /api/v1/doctors/:doctorId/availability
  // Description: Fetches complete timeslot availability for the selected doctor
  // ============================================================================

  useEffect(() => {
    if (id) {
      setDoctor(getDoctorById(id));
    }
  }, [id]);

  return (
    <div className="doctor-availability-page">
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => navigate('/receptionist/doctors')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Doctors Directory</span>
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)' }}>
          Doctor Availability
        </h1>
      </div>

      <DoctorAvailability
        doctor={doctor}
        readOnly={true} // As specified in 2.3: "information only, no editing" for Receptionist
      />
    </div>
  );
}
