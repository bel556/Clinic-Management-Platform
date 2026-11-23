import { db, TODAY } from './mockDb'
import { dateKey, formatDayShort, formatTime } from '../utils/format'

export function patientFullName(patient) {
  if (!patient) return 'Unknown patient'
  return `${patient.firstName} ${patient.lastName}`
}

export function getPatientRecord(patientId) {
  return db().patients.find((patient) => patient.id === patientId) ?? null
}

export function getDoctorRecord(doctorId) {
  return db().doctors.find((doctor) => doctor.id === doctorId) ?? null
}

export function getDoctorName(doctorId) {
  return getDoctorRecord(doctorId)?.name ?? 'Unassigned doctor'
}

export function queueLabel(queue) {
  return queue ? `Q-${String(queue).padStart(2, '0')}` : '—'
}

export function decorateVisit(visit) {
  if (!visit) return null
  const patient = getPatientRecord(visit.patientId)
  const doctor = getDoctorRecord(visit.doctorId)
  return {
    ...visit,
    patient,
    patientName: patientFullName(patient),
    patientPhone: patient?.phone ?? '',
    doctorName: doctor?.name ?? 'Unassigned doctor',
    specialty: doctor?.specialty ?? '',
    room: doctor?.room ?? '',
    timeLabel: formatTime(visit.date),
    dayLabel: formatDayShort(visit.date),
    dayKey: dateKey(visit.date),
    queueLabel: queueLabel(visit.queue),
    isToday: dateKey(visit.date) === TODAY,
  }
}

export function visitNotes(visitId) {
  return db()
    .medicalNotes.filter((note) => note.visitId === visitId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function noteForVisit(visitId, { draft = false } = {}) {
  const notes = visitNotes(visitId)
  if (draft) return notes.find((note) => note.draft) ?? null
  return notes.find((note) => !note.draft) ?? notes[0] ?? null
}

export function sortVisitsByDate(visits, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1
  return [...visits].sort((a, b) => factor * (new Date(a.date) - new Date(b.date)))
}
