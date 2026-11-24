import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Edit2, Trash2, Printer, Search, Calendar, UserCheck, AlertCircle, UserX } from 'lucide-react';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import SearchBar from '../../../components/common/SearchBar';
import {
  getAllVisits,
  createVisit,
  updateVisit,
  deleteVisit,
  checkInVisit,
  getStoredPatients
} from '../../../services/mockData';
import { getTodayDateString, formatDisplayDate, getSelectedTimezone, isPastVisitDateTime } from '../../../utils/dateTime';

export default function Visits() {
  const navigate = useNavigate();

  // ============================================================================
  // BACKEND API INTEGRATION POINT
  // Function: api.visits.getTodaysVisits()
  // Endpoint: GET /api/v1/visits/today
  // Description: Fetches all visits for today across all attending doctors
  // ----------------------------------------------------------------------------
  // Function: api.visits.createVisit(visitPayload)
  // Endpoint: POST /api/v1/visits
  // Description: Front-desk receptionist creates a new visit or appointment
  // ----------------------------------------------------------------------------
  // Function: api.visits.modifyVisit(visitId, updatedPayload)
  // Endpoint: PUT /api/v1/visits/:visitId
  // Description: Receptionist modifies an appointment time, date, doctor, or reason
  // ----------------------------------------------------------------------------
  // Function: api.visits.deleteVisit(visitId)
  // Endpoint: DELETE /api/v1/visits/:visitId
  // Description: Cancels and removes an appointment permanently
  // ----------------------------------------------------------------------------
  // Function: api.visits.checkInPatient(visitId)
  // Endpoint: POST /api/v1/visits/:visitId/check-in
  // Description: Check-in patient, sets status to Present and assigns queue number
  // ============================================================================

  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Upcoming' | 'Present' | 'Missed'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [selectedVisitToModify, setSelectedVisitToModify] = useState(null);
  const [selectedVisitToDelete, setSelectedVisitToDelete] = useState(null);
  const [selectedVisitToCheckIn, setSelectedVisitToCheckIn] = useState(null);
  const [ticketPrintedVisit, setTicketPrintedVisit] = useState(null);

  // Form state for creating a visit
  const todayStr = getTodayDateString();
  const [addFormData, setAddFormData] = useState({
    patientId: '',
    type: 'Appointment',
    date: todayStr,
    timeSlot: '10:00 AM - 10:30 AM',
    speciality: 'Cardiology',
    doctor: 'Dr. Alexander Thorne',
    reason: ''
  });

  // Form state for modifying an existing visit
  const [editFormData, setEditFormData] = useState({
    type: 'Appointment',
    date: todayStr,
    timeSlot: '10:00 AM - 10:30 AM',
    speciality: 'Cardiology',
    doctor: 'Dr. Alexander Thorne',
    reason: ''
  });

  const loadData = () => {
    setVisits(getAllVisits());
    setPatients(getStoredPatients());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('curapulse_visits_updated', loadData);
    return () => window.removeEventListener('curapulse_visits_updated', loadData);
  }, []);

  // Filtered visits calculation
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Upcoming' && v.status?.toLowerCase() !== 'upcoming' && v.status?.toLowerCase() !== 'scheduled') {
          return false;
        }
        if (statusFilter === 'Present' && v.status?.toLowerCase() !== 'present') {
          return false;
        }
        if (statusFilter === 'Missed' && v.status?.toLowerCase() !== 'missed') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const pName = (v.patientName || '').toLowerCase();
        const pId = (v.patientId || '').toLowerCase();
        const dName = (v.doctorName || v.physician || '').toLowerCase();
        return pName.includes(q) || pId.includes(q) || dName.includes(q);
      }

      return true;
    });
  }, [visits, statusFilter, searchQuery]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: visits.length,
      upcoming: visits.filter((v) => v.status?.toLowerCase() === 'upcoming' || v.status?.toLowerCase() === 'scheduled').length,
      present: visits.filter((v) => v.status?.toLowerCase() === 'present').length,
      missed: visits.filter((v) => v.status?.toLowerCase() === 'missed').length
    };
  }, [visits]);

  // --- Handlers ---
  const handleOpenAddModal = () => {
    setAddFormData({
      patientId: patients[0]?.id || 'P-000108',
      type: 'Appointment',
      date: getTodayDateString(),
      timeSlot: '10:00 AM - 10:30 AM',
      speciality: 'Cardiology',
      doctor: 'Dr. Alexander Thorne',
      reason: ''
    });
    setShowAddVisitModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const selPatient = patients.find((p) => p.id === addFormData.patientId) || patients[0];

    // BACKEND API INTEGRATION POINT: api.visits.createVisit(payload)
    createVisit({
      patientId: selPatient.id,
      patientName: `${selPatient.firstName} ${selPatient.lastName}`,
      type: addFormData.type,
      date: addFormData.date,
      time: addFormData.timeSlot.split(' - ')[0],
      dateTime: `${addFormData.date} ${addFormData.timeSlot.split(' - ')[0]}`,
      physician: `${addFormData.doctor} · ${addFormData.speciality}`,
      doctorName: addFormData.doctor,
      speciality: addFormData.speciality,
      reason: addFormData.reason || 'Routine consultation',
      status: 'Upcoming',
      billing: 'Unpaid'
    });

    setShowAddVisitModal(false);
  };

  const handleOpenModifyModal = (visit) => {
    const doctorPart = visit.doctorName || visit.physician?.split(' · ')[0] || 'Dr. Alexander Thorne';
    const specPart = visit.speciality || visit.physician?.split(' · ')[1] || 'Cardiology';

    setEditFormData({
      type: visit.type || 'Appointment',
      date: visit.date || (visit.dateTime ? visit.dateTime.split(' ')[0] : getTodayDateString()),
      timeSlot: visit.time ? `${visit.time} - 30 min` : '10:00 AM - 10:30 AM',
      speciality: specPart,
      doctor: doctorPart,
      reason: visit.reason || '',
      status: visit.status || 'Upcoming'
    });
    setSelectedVisitToModify(visit);
  };

  const handleSaveModifySubmit = (e) => {
    e.preventDefault();
    if (!selectedVisitToModify) return;

    // BACKEND API INTEGRATION POINT: api.visits.modifyVisit(id, updatedPayload)
    updateVisit(selectedVisitToModify.id, {
      type: editFormData.type,
      date: editFormData.date,
      time: editFormData.timeSlot.split(' - ')[0],
      dateTime: `${editFormData.date} ${editFormData.timeSlot.split(' - ')[0]}`,
      physician: `${editFormData.doctor} · ${editFormData.speciality}`,
      doctorName: editFormData.doctor,
      speciality: editFormData.speciality,
      reason: editFormData.reason,
      status: editFormData.status || selectedVisitToModify.status
    });

    setSelectedVisitToModify(null);
  };

  const handleQuickMarkMissed = (visit) => {
    // BACKEND API INTEGRATION POINT: api.visits.markAsMissed(visit.id)
    updateVisit(visit.id, { status: 'Missed' });
  };

  const handleConfirmDelete = () => {
    if (!selectedVisitToDelete) return;
    // BACKEND API INTEGRATION POINT: api.visits.deleteVisit(id)
    deleteVisit(selectedVisitToDelete.id);
    setSelectedVisitToDelete(null);
  };

  const handleConfirmCheckIn = () => {
    if (!selectedVisitToCheckIn) return;
    // BACKEND API INTEGRATION POINT: api.visits.checkInPatient(id)
    checkInVisit(selectedVisitToCheckIn.id);
    setSelectedVisitToCheckIn(null);
  };

  return (
    <div className="visits-page">
      {/* Header Banner (Figma Page 35) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              Today's Visits
            </h1>
            <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
              {formatDisplayDate(todayStr, getSelectedTimezone())}
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Manage front desk check-in, patient queues, and appointment schedules.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          icon={<Plus size={16} />}
        >
          + Add Visit
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 16,
          flexWrap: 'wrap'
        }}
      >
        {/* Status Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'All', label: `All ${counts.all}` },
            { key: 'Upcoming', label: `Upcoming ${counts.upcoming}` },
            { key: 'Present', label: `Present ${counts.present}` },
            { key: 'Missed', label: `Missed ${counts.missed}` }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.key ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                color: statusFilter === tab.key ? '#FFFFFF' : 'var(--color-text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Search patient name, ID, or doctor..."
          />
        </div>
      </div>

      {/* Visits Table Card */}
      <div className="card table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>TIME / SLOT</th>
              <th>PATIENT</th>
              <th>DOCTOR</th>
              <th>VISIT TYPE</th>
              <th>STATUS</th>
              <th>BILLING</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.length > 0 ? (
              filteredVisits.map((v, idx) => {
                const isPresent = v.status?.toLowerCase() === 'present';
                const isMissed = v.status?.toLowerCase() === 'missed';
                const isUpcoming = v.status?.toLowerCase() === 'upcoming' || v.status?.toLowerCase() === 'scheduled';
                const isPaid = v.billing?.toLowerCase() === 'paid';

                return (
                  <tr key={v.id || idx}>
                    {/* Time / Slot */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13px' }}>
                        {v.time || (v.dateTime ? v.dateTime.split(' ')[1] : '09:00 AM')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {v.slotNumber || `Slot #${idx + 1}`}
                      </div>
                    </td>

                    {/* Patient */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/receptionist/patients/${v.patientId}`)}
                      >
                        {v.patientName}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {v.patientId}
                      </div>
                    </td>

                    {/* Doctor */}
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '12.5px' }}>
                        {v.doctorName || v.physician?.split(' · ')[0]}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {v.speciality || v.physician?.split(' · ')[1] || 'Cardiology'}
                      </div>
                    </td>

                    {/* Visit Type */}
                    <td style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {v.type}
                    </td>

                    {/* Status */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span
                        className={`badge ${
                          isPresent
                            ? 'badge-present'
                            : isMissed
                            ? 'badge-missed'
                            : 'badge-scheduled'
                        }`}
                      >
                        • {v.status}
                      </span>
                      {v.queueNumber && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--color-primary)'
                          }}
                        >
                          {v.queueNumber}
                        </span>
                      )}

                      {/* If appointment date/time is in the past and patient did not arrive, show quick "Mark Missed" button */}
                      {isUpcoming && isPastVisitDateTime(v.date || v.dateTime, v.time) && (
                        <button
                          type="button"
                          onClick={() => handleQuickMarkMissed(v)}
                          title="Patient did not arrive before scheduled time. Mark as Missed."
                          style={{
                            marginLeft: 6,
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
                    </td>

                    {/* Billing */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className={isPaid ? 'badge-paid' : 'badge-unpaid'}>
                        {isPaid ? '✓ Paid' : '○ Unpaid'}
                      </span>
                    </td>

                    {/* Actions: Check-in, Modify, Delete, Print Ticket */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {/* Check-in Action for Upcoming */}
                        {isUpcoming && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="btn-pill"
                            onClick={() => setSelectedVisitToCheckIn(v)}
                            style={{ fontSize: '11.5px', padding: '3px 10px' }}
                            icon={<UserCheck size={13} />}
                          >
                            Check-in
                          </Button>
                        )}

                        {/* Print Ticket */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Print Ticket"
                          onClick={() => setTicketPrintedVisit(v)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Printer size={15} style={{ color: 'var(--color-primary)' }} />
                        </button>

                        {/* Modify / Edit Appointment */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Edit / Modify Appointment"
                          onClick={() => handleOpenModifyModal(v)}
                          style={{ padding: 4, borderRadius: 4, cursor: 'pointer' }}
                        >
                          <Edit2 size={15} style={{ color: 'var(--color-text-secondary)' }} />
                        </button>

                        {/* Delete Appointment */}
                        <button
                          type="button"
                          className="btn-ghost"
                          title="Delete Appointment"
                          onClick={() => setSelectedVisitToDelete(v)}
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
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>
                  No appointments found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* 1. Add Visit Modal (Figma Page 6) */}
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
            <Button variant="primary" onClick={handleCreateSubmit}>
              Create {addFormData.type.toLowerCase()}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Patient Selection Dropdown */}
          <Input
            label="SELECT PATIENT"
            required
            as="select"
            value={addFormData.patientId}
            onChange={(e) => setAddFormData((prev) => ({ ...prev, patientId: e.target.value }))}
            options={patients.map((p) => ({
              value: p.id,
              label: `${p.firstName} ${p.lastName} (${p.id} • ${p.phone})`
            }))}
          />

          {/* Visit Type Buttons */}
          <div>
            <label className="input-label" style={{ marginBottom: 6, display: 'block' }}>
              VISIT TYPE *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Regular', 'Appointment', 'Consultation'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAddFormData((prev) => ({ ...prev, type }))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: addFormData.type === type ? 'var(--color-primary)' : 'var(--color-bg-muted)',
                    color: addFormData.type === type ? '#FFFFFF' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type}
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
              value={addFormData.date}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
            <Input
              label="SPECIALITY"
              required
              as="select"
              value={addFormData.speciality}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, speciality: e.target.value }))}
              options={['Cardiology', 'Neurology', 'Pediatrics', 'General Practice']}
            />
          </div>

          {/* Available Doctor & Timeslot */}
          <div className="form-grid-2col">
            <Input
              label="AVAILABLE DOCTOR"
              required
              as="select"
              value={addFormData.doctor}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, doctor: e.target.value }))}
              options={['Dr. Alexander Thorne', 'Dr. Elena Vance', 'Dr. Robert Chen', 'Dr. Maya Lin']}
            />
            <Input
              label="AVAILABLE TIME SLOT"
              required
              as="select"
              value={addFormData.timeSlot}
              onChange={(e) => setAddFormData((prev) => ({ ...prev, timeSlot: e.target.value }))}
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
            value={addFormData.reason}
            onChange={(e) => setAddFormData((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Follow-up consultation, symptoms..."
          />

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
            {addFormData.type === 'Regular'
              ? 'Regular visits receive an auto-assigned queue number upon creation (first come, first served).'
              : 'Appointment queue: assigned automatically at check-in on the day of the visit.'}{' '}
            Payment defaults to <strong>Unpaid (read-only for reception)</strong>.
          </div>
        </form>
      </Modal>

      {/* 2. Modify Visit Modal (Figma Page 27) */}
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
            <Button variant="primary" onClick={handleSaveModifySubmit}>
              Save visit changes
            </Button>
          </>
        }
      >
        {selectedVisitToModify && (
          <form onSubmit={handleSaveModifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Visits / {selectedVisitToModify.id} / Modify visit
            </div>

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
              {selectedVisitToModify.patientName} · {selectedVisitToModify.patientId} · Visit {selectedVisitToModify.id}
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

            {/* Visit Status Selection & Past-due Detection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="input-label">VISIT STATUS</label>
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
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor:
                        editFormData.status === st
                          ? st === 'Present'
                            ? 'var(--color-primary)'
                            : st === 'Missed'
                            ? 'var(--color-danger)'
                            : '#2563EB'
                          : 'var(--color-bg-muted)',
                      color: editFormData.status === st ? '#FFFFFF' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    • {st}
                  </button>
                ))}
              </div>
              {isPastVisitDateTime(editFormData.date, editFormData.timeSlot.split(' - ')[0]) && editFormData.status !== 'Present' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-danger-light)',
                    color: 'var(--color-danger)',
                    fontSize: '11.5px',
                    marginTop: 4
                  }}
                >
                  <AlertCircle size={14} />
                  <span>
                    Note: This appointment date &amp; time is in the past. If the patient did not come, please mark as <strong>Missed</strong>.
                  </span>
                </div>
              )}
            </div>

            <Input
              label="REASON / DETAILS"
              as="textarea"
              rows={2}
              value={editFormData.reason}
              onChange={(e) => setEditFormData((prev) => ({ ...prev, reason: e.target.value }))}
            />
          </form>
        )}
      </Modal>

      {/* 3. Delete Confirmation Modal (Figma Page 7) */}
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
              {selectedVisitToDelete.id} · {selectedVisitToDelete.patientName}
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

      {/* 4. Check-in Confirmation Modal (Figma Page 3) */}
      <Modal
        isOpen={Boolean(selectedVisitToCheckIn)}
        onClose={() => setSelectedVisitToCheckIn(null)}
        tag="PATIENT ARRIVAL"
        title="Check in this patient?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelectedVisitToCheckIn(null)}>
              Not yet
            </Button>
            <Button variant="primary" onClick={handleConfirmCheckIn}>
              Check in patient
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
          This adds the patient to today's waiting queue. A queue number will be assigned automatically in arrival order.
        </p>
        {selectedVisitToCheckIn && (
          <div className="modal-preview-box">
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '13.5px' }}>
              {selectedVisitToCheckIn.patientName} · {selectedVisitToCheckIn.patientId}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {selectedVisitToCheckIn.type} · Today, {selectedVisitToCheckIn.time}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {selectedVisitToCheckIn.physician}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: 8 }}>
              The visit status will change from Upcoming to Present.
            </div>
          </div>
        )}
      </Modal>

      {/* 5. Print Ticket Preview Modal (Figma Page 2 & 37) */}
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
              {ticketPrintedVisit.patientName} ({ticketPrintedVisit.patientId})
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
