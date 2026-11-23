import React, { useState } from 'react';
import { Calendar, Printer, Edit2, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';

export default function UpcomingAppointments({
  visits = [],
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
                const isScheduled = visit.status?.toLowerCase() === 'scheduled' || visit.status?.toLowerCase() === 'upcoming';
                const isPaid = visit.billing?.toLowerCase() === 'paid';

                return (
                  <tr key={visit.id || idx}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '12.5px' }}>
                        {visit.id || `V-2024-00${45 + idx}`}
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
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* Print Ticket (Page 2 & 37) */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Print Ticket"
                          onClick={() => handlePrint(visit)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Printer size={15} style={{ color: 'var(--color-primary)' }} />
                        </button>

                        {/* Modify Visit (Page 27) */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Modify Visit"
                          onClick={() => onModifyVisit?.(visit)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Edit2 size={15} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>

                        {/* Delete Visit (Page 7) */}
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
          This permanently removes the visit from the schedule and the waiting queue, if checked in. The patient record and other visits are kept.
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
              Q-05
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: 8 }}>
              Visit ID: {ticketPrintedVisit.id || 'V-2024-0046'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: 4 }}>
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
