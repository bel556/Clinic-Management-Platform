import { db } from './mockDb'
import { delay } from './http'
import {
  decorateVisit,
  getDoctorName,
  getPatientRecord,
  patientFullName,
  sortVisitsByDate,
} from './model'
import { dateKey } from '../utils/format'
import { TODAY } from './mockDb'

function nextPatientId() {
  const highest = db().patients.reduce((max, patient) => {
    const numeric = Number(String(patient.id).replace(/\D/g, ''))
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max
  }, 0)
  return `P-${String(highest + 1).padStart(6, '0')}`
}

export function matchPatient(patient, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return false
  const name = patientFullName(patient).toLowerCase()
  return (
    patient.id.toLowerCase().includes(needle) ||
    name.includes(needle) ||
    patient.phone.toLowerCase().includes(needle) ||
    (patient.email ?? '').toLowerCase().includes(needle)
  )
}

export function searchPatientsSync(query, limit = 20) {
  return db()
    .patients.filter((patient) => matchPatient(patient, query))
    .slice(0, limit)
    .map((patient) => ({
      ...patient,
      fullName: patientFullName(patient),
      primaryPhysician: getDoctorName(patient.primaryPhysicianId),
    }))
}

export async function searchPatients(query, limit = 20) {
  return delay(searchPatientsSync(query, limit))
}

export async function listPatientDirectory() {
  const patients = db().patients.map((patient) => ({
    ...patient,
    fullName: patientFullName(patient),
    primaryPhysician: getDoctorName(patient.primaryPhysicianId),
  }))

  const recent = [...patients]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 4)

  const searched = db()
    .recentlySearched.map((id) => patients.find((patient) => patient.id === id))
    .filter(Boolean)

  return delay({ patients, recent, searched })
}

export async function getPatient(patientId) {
  const patient = getPatientRecord(patientId)
  if (!patient) throw new Error('Patient not found')

  const visits = db()
    .visits.filter((visit) => visit.patientId === patientId)
    .map(decorateVisit)

  const upcoming = sortVisitsByDate(
    visits.filter((visit) => ['Upcoming', 'Present'].includes(visit.status)),
  )
  const past = sortVisitsByDate(
    visits.filter((visit) => ['Done', 'Missed', 'Cancelled'].includes(visit.status)),
    'desc',
  )

  return delay({
    ...patient,
    fullName: patientFullName(patient),
    primaryPhysician: getDoctorName(patient.primaryPhysicianId),
    visits,
    upcoming,
    past,
    lastVisit: past[0] ?? null,
  })
}

export async function createPatient(payload) {
  const patient = {
    id: nextPatientId(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    birthDate: payload.birthDate,
    gender: payload.gender,
    phone: payload.phone.trim(),
    email: payload.email?.trim() ?? '',
    emergencyContact: payload.emergencyContact?.trim() ?? '',
    additionalInfo: payload.additionalInfo?.trim() || 'No additional information',
    bloodType: payload.bloodType ?? '—',
    primaryPhysicianId: payload.primaryPhysicianId ?? 'D-04',
    registeredAt: `${TODAY}T09:42:00`,
    allergies: [],
    conditions: [],
    vitals: { bp: '—', hr: '—', bmi: '—', recordedAt: null },
  }

  db().patients.push(patient)
  rememberPatient(patient.id)
  return delay(patient)
}

export async function updatePatient(patientId, payload) {
  const patient = getPatientRecord(patientId)
  if (!patient) throw new Error('Patient not found')

  Object.assign(patient, {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    birthDate: payload.birthDate,
    gender: payload.gender,
    phone: payload.phone.trim(),
    email: payload.email?.trim() ?? '',
    emergencyContact: payload.emergencyContact?.trim() ?? '',
    additionalInfo: payload.additionalInfo?.trim() || 'No additional information',
  })

  return delay(patient)
}

export function rememberPatient(patientId) {
  const recent = db().recentlySearched.filter((id) => id !== patientId)
  db().recentlySearched = [patientId, ...recent].slice(0, 4)
}

export async function getPatientHistory(patientId) {
  const patient = getPatientRecord(patientId)
  if (!patient) throw new Error('Patient not found')

  const visits = db()
    .visits.filter((visit) => visit.patientId === patientId)
    .map(decorateVisit)

  const entries = visits
    .map((visit) => ({
      visit,
      notes: db()
        .medicalNotes.filter((note) => note.visitId === visit.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    }))
    .filter((entry) => entry.notes.length > 0)
    .sort((a, b) => new Date(b.visit.date) - new Date(a.visit.date))

  return delay({
    patient: { ...patient, fullName: patientFullName(patient) },
    entries,
    visits: sortVisitsByDate(visits, 'desc'),
    isToday: (visit) => dateKey(visit.date) === TODAY,
  })
}
