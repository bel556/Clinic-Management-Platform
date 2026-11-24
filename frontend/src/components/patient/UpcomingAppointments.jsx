import React, { useState } from 'react';
import { Calendar, Printer, Edit2, Trash2, AlertTriangle, UserX } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { isPastVisitDateTime } from '../../utils/dateTime';

export default function UpcomingAppointments({
  visits = [],
  patientName = 'Patient',
  patientId = '',
  onViewTimeline,
  onModifyVisit,
  onDeleteVisit,
  onPrintTicket
}) {
  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.visits.getPatientVisits(patientId)
  // Endpoint: GET /api/v1/patients/:patientId/visits
  // Description: Fetches all upcoming, present, and missed visits for this patient
  // ----------------------------------------------------------------------------
  // Function: api.visits.modifyVisit(visitId, updatedPayload)
  // Endpoint: PUT /api/v1/visits/:visitId
  // Description: Updates scheduled appointment details (date, time, doctor, reason, status)
  // ----------------------------------------------------------------------------
  // Function: api.visits.markAsMissed(visitId)
  // Endpoint: PATCH /api/v1/visits/:visitId/status
  // Payload: { status: 'Missed', note: 'Patient did not arrive before scheduled time' }
  // Description: Marks an appointment as Missed if visit date/time has passed
  // ----------------------------------------------------------------------------
  // Function: api.visits.deleteVisit(visitId)
  // Endpoint: DELETE /api/v1/visits/:visitId
  // Description: Permanently removes a scheduled visit from queue & calendar
  // ----------------------------------------------------------------------------
  // Function: api.visits.printTicket(visitId)
  // Endpoint: POST /api/v1/visits/:visitId/print-ticket
  // Description: Generates front-desk ticket with queue number for today's visits
  // ============================================================================

  const [selectedVisitToDelete, setSelectedVisitToDelete] = useState(null);
  const [ticketPrintedVisit, setTicketPrintedVisit] = useState(null);
  const [selectedVisitToModify, setSelectedVisitToModify] = useState(null);

  // Modify Visit Form State (Figma Page 27)
  const [editFormData, setEditFormData] = useState({
    type: 'Appointment',
    date: '',
    timeSlot: '10:00 AM - 10:30 AM',
    speciality: 'Cardiology',
    doctor: 'Dr. Alexander Thorne',
    status: 'Upcoming',
    reason: ''
  });

  const handleOpenModifyModal = (visit) => {
    const doctorPart = visit.doctorName || visit.physician?.split(' · ')[0] || 'Dr. Alexander Thorne';
    const specPart = visit.speciality || visit.physician?.split(' · ')[1] || 'Cardiology';

    setEditFormData({
      type: visit.type || 'Appointment',
      date: visit.date || (visit.dateTime ? visit.dateTime.split(' ')[0] : ''),
      timeSlot: visit.time ? `${visit.time} - 30 min` : '10:00 AM - 10:30 AM',
      speciality: specPart,
      doctor: doctorPart,
      status: visit.status || 'Upcoming',
      reason: visit.reason || ''
    });
    setSelectedVisitToModify(visit);
  };

  const handleSaveModifiedVisit = (e) => {
    e.preventDefault();
    if (!selectedVisitToModify) return;

    // Check if appointment is overdue and patient hasn't arrived
    const isPast = isPastVisitDateTime(editFormData.date, editFormData.timeSlot.split(' - ')[0]);
    let finalStatus = editFormData.status;
    if (isPast && finalStatus === 'Upcoming') {
      // Prompt receptionist or default to Missed if they didn't come
      finalStatus = 'Missed';
    }

    const updatedVisit = {
      ...selectedVisitToModify,
      type: editFormData.type,
      date: editFormData.date,
      time: editFormData.timeSlot.split(' - ')[0],
      dateTime: `${editFormData.date} ${editFormData.timeSlot.split(' - ')[0]}`,
      physician: `${editFormData.doctor} · ${editFormData.speciality}`,
      doctorName: editFormData.doctor,
      speciality: editFormData.speciality,
      status: finalStatus,
      reason: editFormData.reason
    };

    onModifyVisit?.(updatedVisit);
    setSelectedVisitToModify(null);
  };

  const handleQuickMarkMissed = (visit) => {
    // BACKEND API INTEGRATION POINT: api.visits.markAsMissed(visit.id)
    const updatedVisit = {
      ...visit,
      status: 'Missed'
    };
    onModifyVisit?.(updatedVisit);
  };

  const handlePrint = (visit) => {
    // BACKEND API INTEGRATION POINT: api.visits.printTicket(visit.id)
    if (onPrintTicket) {
      onPrintTicket(visit);
    } else {
      setTicketPrintedVisit(visit);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedVisitToDelete) {
      // BACKEND API INTEGRATION POINT: api.visits.deleteVisit(selectedVisitToDelete.id)
      onDeleteVisit?.(selectedVisitToDelete.id);
      setSelectedVisitToDelete(null);
    }
  };

  const isFormDatePast = isPastVisitDateTime(editFormData.date, editFormData.timeSlot.split(' - ')[0]);

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={17} style={{ color: 'var(--color-primary)' }} />
          <h3 className="card-title" style={{ fontSize: '14.5px' }}>
            Recent & Upcoming Visits
          </h3>
        </div>
        {onViewTimeline && (
          <button
            type="button"
            onClick={onViewTimeline}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            View Full Timeline
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>VISIT ID / TIME</th>
              <th>TYPE & DOCTOR</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visits && visits.length > 0 ? (
              visits.map((visit, idx) => {
                const isPresent = visit.status?.toLowerCase() === 'present';
                const isMissed = visit.status?.toLowerCase() === 'missed';
                const isScheduled =
                  visit.status?.toLowerCase() === 'scheduled' ||
                  visit.status?.toLowerCase() === 'upcoming';
                const isPaid = visit.billing?.toLowerCase() === 'paid';

                const isPast = isPastVisitDateTime(visit.date || visit.dateTime, visit.time);

                return (
                  <tr key={visit.id || idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '12.5px' }}>
                        {visit.id || `V-2026-00${45 + idx}`}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {visit.dateTime}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13px' }}>
                        {visit.type || 'Appointment'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {visit.physician}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: 1 }}>
                        {visit.reason}
                      </div>
                    </td>
                    <td>
                      <span className={isPaid ? 'badge-paid' : 'badge-unpaid'}>
                        {isPaid ? '✓ Paid' : '○ Unpaid (read-only)'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          className={`badge ${
                            isPresent
                              ? 'badge-present'
                              : isMissed
                              ? 'badge-missed'
                              : isScheduled
                              ? 'badge-scheduled'
                              : 'badge-completed'
                          }`}
                        >
                          • {visit.status}
                        </span>

                        {/* If appointment date/time is in the past and patient did not come, offer quick "Mark Missed" button */}
                        {isScheduled && isPast && (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkMissed(visit)}
                            title="Patient did not arrive before scheduled time. Mark as Missed."
                            style={{
                              padding: '2px 7px',
                              borderRadius: 'var(--radius-pill)',
                              border: '1px solid var(--color-danger)',
                              backgroundColor: 'var(--color-danger-light)',
                              color: 'var(--color-danger)',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }}
                          >
                            <UserX size={11} />
                            Mark Missed
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* Print Ticket */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Print Ticket"
                          onClick={() => handlePrint(visit)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Printer size={15} style={{ color: 'var(--color-primary)' }} />
                        </button>

                        {/* Modify / Edit Visit */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Modify Visit / Reschedule"
                          onClick={() => handleOpenModifyModal(visit)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Edit2 size={15} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>

                        {/* Delete Visit */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Delete Visit"
                          onClick={() => setSelectedVisitToDelete(visit)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Trash2 size={15} style={{ color: 'var(--color-danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px' }}>
                  No visits recorded for this patient.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modify Visit Modal (Sprint 1 Page 27 with Status & Overdue detection) */}
      <Modal
        isOpen={Boolean(selectedVisitToModify)}
        onClose={() => setSelectedVisitToModify(null)}
        title="Modify visit"
        maxWidth="640px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedVisitToModify(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveModifiedVisit}>
              Save visit changes
            </Button>
          </>
        }
      >
        {selectedVisitToModify && (
          <form onSubmit={handleSaveModifiedVisit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header Breadcrumb reference */}
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Visits / {selectedVisitToModify.id} / Modify visit
            </div>

            {/* Patient Header Box */}
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
              {patientName} · {patientId} · Visit {selectedVisitToModify.id}
            </div>

            {/* Overdue Alert banner if scheduled time < current time and patient did not show up */}
            {isFormDatePast && editFormData.status !== 'Present' && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-danger-light)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10
                }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: '12px', color: 'var(--color-danger)' }}>
                  <strong>Scheduled Time Expired:</strong> This visit was scheduled for a date/time earlier than today/now. If the patient did not attend, the status should be set to <strong>Missed</strong>.
                  <div style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => setEditFormData((prev) => ({ ...prev, status: 'Missed' }))}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-danger)',
                        backgroundColor: '#FFFFFF',
                        color: 'var(--color-danger)',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Set Status to Missed
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Visit Status Selector */}
            <div>
              <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>
                VISIT STATUS *
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Upcoming', 'Present', 'Missed'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditFormData((prev) => ({ ...prev, status: st }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor:
                        editFormData.status === st
                          ? st === 'Missed'
                            ? 'var(--color-danger)'
                            : 'var(--color-primary)'
                          : 'var(--color-bg-muted)',
                      color: editFormData.status === st ? '#FFFFFF' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit Type Buttons */}
            <div>
              <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>
                VISIT TYPE *
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Regular', 'Appointment', 'Consultation'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEditFormData((prev) => ({ ...prev, type: t }))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-pill)',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor:
                        editFormData.type === t ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                      color: editFormData.type === t ? '#FFFFFF' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Speciality */}
            <div className="form-grid-2col">
              <Input
                label="DATE"
                required
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
              />
              <Input
                label="SPECIALITY"
                required
                as="select"
                value={editFormData.speciality}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, speciality: e.target.value }))}
                options={['Cardiology', 'Neurology', 'Pediatrics', 'General Practice']}
              />
            </div>

            {/* Available Doctor & Timeslot */}
            <div className="form-grid-2col">
              <Input
                label="AVAILABLE DOCTOR"
                required
                as="select"
                value={editFormData.doctor}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, doctor: e.target.value }))}
                options={['Dr. Alexander Thorne', 'Dr. Elena Vance', 'Dr. Robert Chen', 'Dr. Maya Lin']}
              />
              <Input
                label="AVAILABLE TIME SLOT"
                required
                as="select"
                value={editFormData.timeSlot}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, timeSlot: e.target.value }))}
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

            {/* Reason / Details */}
            <Input
              label="REASON / DETAILS"
              as="textarea"
              rows={2}
              value={editFormData.reason}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Follow-up consultation, blood pressure review..."
            />

            {/* Informational Box */}
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
              Appointment queue: assigned automatically at check-in, first come, first served.
              Payment: <strong>Unpaid (read-only for reception)</strong>.
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal (Sprint 1 Page 7) */}
      <Modal
        isOpen={Boolean(selectedVisitToDelete)}
        onClose={() => setSelectedVisitToDelete(null)}
        tag="DELETE VISIT"
        title="Delete this visit?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedVisitToDelete(null)}>
              Keep visit
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete visit
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
          This permanently removes the visit from the schedule and the waiting queue, if checked in.
          The patient record and other visits are kept.
        </p>
        {selectedVisitToDelete && (
          <div className="modal-preview-box">
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13.5px' }}>
              {selectedVisitToDelete.id} · {selectedVisitToDelete.type || 'Appointment'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {selectedVisitToDelete.dateTime} · {selectedVisitToDelete.physician}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 8 }}>
              This action cannot be undone. Payment status is not changed.
            </div>
          </div>
        )}
      </Modal>

      {/* Ticket Preview Modal (Sprint 1 Page 2 & 37) */}
      <Modal
        isOpen={Boolean(ticketPrintedVisit)}
        onClose={() => setTicketPrintedVisit(null)}
        title="Front Desk Ticket"
        footer={
          <Button variant="primary" onClick={() => setTicketPrintedVisit(null)}>
            Close Ticket
          </Button>
        }
      >
        {ticketPrintedVisit && (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>
              CuraPulse Clinic
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Downtown Medical Center
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-subtle)', marginTop: 14 }}>
              QUEUE NUMBER
            </div>
            <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.04em' }}>
              {ticketPrintedVisit.queueNumber || 'Q-05'}
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: 8 }}>
              Visit ID: {ticketPrintedVisit.id}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {patientName} ({patientId})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {ticketPrintedVisit.physician}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 12 }}>
              Please watch the waiting-room display for your queue number.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
