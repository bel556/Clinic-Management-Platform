import React, { useState } from 'react';
import { ArrowLeft, Edit3, Plus, User, Heart } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import UpcomingAppointments from './UpcomingAppointments';

export default function PatientDetails({
  patient,
  onBack,
  onEdit,
  onViewTimeline,
  onAddVisitComplete
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.patients.getPatientDetails(patientId)
  // Endpoint: GET /api/v1/patients/${patient.id}
  // Description: Fetches comprehensive patient profile, demographics & clinical baseline
  // ----------------------------------------------------------------------------
  // Function: api.visits.createPatientVisit(visitPayload)
  // Endpoint: POST /api/v1/visits
  // Description: Schedules a new visit (Regular / Appointment / Consultation)
  // ----------------------------------------------------------------------------
  // Function: api.doctors.getAvailableBySpeciality(speciality, date)
  // Endpoint: GET /api/v1/doctors/available?speciality=${speciality}&date=${date}
  // Description: Returns active doctors and open timeslots for the selected specialty
  // ============================================================================

  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [visitType, setVisitType] = useState('Appointment'); // 'Regular' | 'Appointment' | 'Consultation'
  const [visitDate, setVisitDate] = useState('2024-10-30');
  const [speciality, setSpeciality] = useState('Cardiology');
  const [selectedDoctor, setSelectedDoctor] = useState('Dr. Alexander Thorne');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [reason, setReason] = useState('Follow-up consultation and blood pressure review');

  if (!patient) return null;

  const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();
  const baselines = patient.clinicalBaselines || {};

  const handleCreateVisit = (e) => {
    e.preventDefault();

    // ============================================================================
    // BACKEND API INTEGRATION POINT
    // Function: api.visits.createVisit({
    //   patientId: patient.id,
    //   type: visitType,
    //   date: visitDate,
    //   speciality: speciality,
    //   doctorId: 'doc-1',
    //   doctorName: selectedDoctor,
    //   timeSlot: timeSlot,
    //   reason: reason,
    //   queueNumber: visitType === 'Regular' ? 'Q-06' : null,
    //   billingStatus: 'Unpaid' // Read-only for receptionist; Finance changes later
    // })
    // ============================================================================

    const newVisitObj = {
      id: `V-2024-00${Math.floor(Math.random() * 90) + 10}`,
      dateTime: `${visitDate} ${timeSlot.split(' - ')[0]}`,
      type: visitType,
      physician: `${selectedDoctor} · ${speciality}`,
      reason: reason || 'Scheduled visit',
      status: 'Upcoming',
      billing: 'Unpaid'
    };

    onAddVisitComplete?.(newVisitObj);
    setShowAddVisitModal(false);
  };

  return (
    <div className="patient-details-container" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top action row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Patients Directory</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={onEdit}
            icon={<Edit3 size={14} />}
          >
            Edit Details
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowAddVisitModal(true)}
            icon={<Plus size={15} />}
          >
            + Add Visit
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div
        className="card"
        style={{
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: '240px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              fontSize: '17px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #E0E7FF',
              flexShrink: 0
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {patient.firstName} {patient.lastName}
              </h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em'
                }}
              >
                {patient.gender?.toUpperCase()}, {patient.age} YRS
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginTop: 2 }}>
              ID: {patient.id}
            </div>
          </div>
        </div>

        {/* Top 3 Meta Stats (Responsive wrap) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.05em' }}>
              BLOOD TYPE
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-primary)', marginTop: 2 }}>
              {patient.bloodType || 'O+ Positive'}
            </div>
          </div>

          <div style={{ width: 1, height: 26, backgroundColor: 'var(--color-border)' }} />

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.05em' }}>
              PRIMARY PHYSICIAN
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 2 }}>
              {patient.primaryPhysician || 'Dr. A. Thorne'}
            </div>
          </div>

          <div style={{ width: 1, height: 26, backgroundColor: 'var(--color-border)' }} />

          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.05em' }}>
              REGISTERED SINCE
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 2 }}>
              {patient.registeredSince || 'Feb 2021'}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="patient-details-grid">
        {/* Left Column: Demographics & Clinical Baselines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Demographics & Contact Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="card-title" style={{ fontSize: '14px' }}>Demographics & Contact</h3>
              </div>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  Phone Number
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {patient.phone}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  Email Address
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                  {patient.email || 'None provided'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                  Emergency Contact
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                  {patient.emergencyContact || 'None provided'}
                </div>
              </div>

              {patient.additionalInfo && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: 2 }}>
                    Additional Information
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {patient.additionalInfo}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clinical Baselines Card */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Heart size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="card-title" style={{ fontSize: '14px' }}>Clinical Baselines</h3>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Last Recorded {baselines.lastRecorded || 'Oct 24, 2024'}
              </span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.04em', marginBottom: 4 }}>
                  KNOWN ALLERGIES
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {baselines.knownAllergies || 'None recorded'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--color-text-subtle)', letterSpacing: '0.04em', marginBottom: 4 }}>
                  CHRONIC CONDITIONS
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  {baselines.chronicConditions || 'None recorded'}
                </div>
              </div>

              {/* Responsive Vitals Grid */}
              <div className="vitals-grid">
                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>RESTING BP</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
                    {baselines.restingBp || '124/82'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>mmHg</div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>HEART RATE</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
                    {baselines.heartRate || '71'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>bpm</div>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)' }}>BMI METRIC</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: 4 }}>
                    {baselines.bmiMetric || '23.8 Normal'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming & Recent Visits */}
        <div>
          <UpcomingAppointments
            visits={patient.recentVisits || []}
            onViewTimeline={onViewTimeline}
          />
        </div>
      </div>

      {/* Add Visit Form Modal (Sprint 1 Page 6 & Logic 2.1) */}
      <Modal
        isOpen={showAddVisitModal}
        onClose={() => setShowAddVisitModal(false)}
        title="Add patient visit"
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddVisitModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateVisit}>
              Create {visitType.toLowerCase()}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateVisit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient Overview Box */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-main)'
            }}
          >
            {patient.firstName} {patient.lastName} · {patient.id} · {patient.phone}
          </div>

          {/* 1. Visit Type Selector */}
          <div>
            <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>
              VISIT TYPE *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Regular', 'Appointment', 'Consultation'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVisitType(type)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: visitType === type ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                    color: visitType === type ? '#FFFFFF' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Date & Speciality (Responsive 2-Col) */}
          <div className="form-grid-2col">
            <Input
              label="DATE"
              required
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
            <Input
              label="SPECIALITY"
              required
              as="select"
              value={speciality}
              onChange={(e) => setSpeciality(e.target.value)}
              options={['Cardiology', 'Neurology', 'Pediatrics', 'General Practice']}
            />
          </div>

          {/* 3. Available Doctor & Timeslot (Responsive 2-Col) */}
          <div className="form-grid-2col">
            <Input
              label="AVAILABLE DOCTOR"
              required
              as="select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              options={['Dr. Alexander Thorne', 'Dr. Elena Vance', 'Dr. Robert Chen', 'Dr. Maya Lin']}
            />
            <Input
              label="AVAILABLE TIME SLOT"
              required
              as="select"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              options={[
                '08:30 AM - 09:00 AM',
                '09:30 AM - 10:00 AM',
                '10:00 AM - 10:30 AM',
                '11:30 AM - 12:00 PM',
                '01:30 PM - 02:00 PM',
                '02:30 PM - 03:00 PM'
              ]}
            />
          </div>

          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11.5px',
              color: 'var(--color-primary)'
            }}
          >
            {speciality} · Available slots verified for {visitDate}.
          </div>

          {/* Reason / Details */}
          <Input
            label="REASON / DETAILS"
            as="textarea"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Follow-up consultation, symptoms..."
          />

          {/* 4. Queue number auto-assigned notice */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4
            }}
          >
            {visitType === 'Regular'
              ? 'Regular visits receive an auto-assigned queue number upon creation (first come, first served).'
              : 'Appointment queue: assigned automatically at check-in on the day of the visit.'}{' '}
            Payment defaults to <strong>Unpaid (read-only for reception)</strong>.
          </div>
        </form>
      </Modal>
    </div>
  );
}
