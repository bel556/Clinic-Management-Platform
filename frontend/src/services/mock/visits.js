import { db, isToday, nextVisitId, TODAY } from '../mockDb'
import { delay } from '../http'
import {
  decorateVisit,
  getDoctorRecord,
  getPatientRecord,
  sortVisitsByDate,
} from '../model'
import { dateKey } from '../../utils/format'
import { slotStart24 } from '../adapters'

function sameDay(visit, day) {
  return dateKey(visit.date) === dateKey(day)
}

function nextQueueNumber(doctorId, day) {
  const used = db()
    .visits.filter(
      (visit) =>
        visit.doctorId === doctorId &&
        sameDay(visit, day) &&
        Number.isFinite(visit.queue),
    )
    .map((visit) => visit.queue)
  return used.length ? Math.max(...used) + 1 : 1
}

export function filterVisits({
  status = 'all',
  query = '',
  doctorId = 'all',
  day = TODAY,
} = {}) {
  const needle = query.trim().toLowerCase()

  return sortVisitsByDate(
    db()
      .visits.filter((visit) => sameDay(visit, day))
      .map(decorateVisit)
      .filter((visit) => (status === 'all' ? true : visit.status === status))
      .filter((visit) => (doctorId === 'all' ? true : visit.doctorId === doctorId))
      .filter((visit) => {
        if (!needle) return true
        return (
          visit.patientName.toLowerCase().includes(needle) ||
          visit.patientId.toLowerCase().includes(needle) ||
          visit.doctorName.toLowerCase().includes(needle)
        )
      }),
  )
}

export function countVisits(day = TODAY) {
  const rows = db().visits.filter((visit) => sameDay(visit, day))
  return {
    all: rows.length,
    Upcoming: rows.filter((visit) => visit.status === 'Upcoming').length,
    Present: rows.filter((visit) => visit.status === 'Present').length,
    Missed: rows.filter((visit) => visit.status === 'Missed').length,
    Done: rows.filter((visit) => visit.status === 'Done').length,
  }
}

export async function listVisitBoard({
  status = 'all',
  query = '',
  doctorId = 'all',
  page = 1,
  pageSize = 10,
  day = TODAY,
} = {}) {
  const rows = filterVisits({ status, query, doctorId, day })
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)

  return delay({
    rows: rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: rows.length,
    counts: countVisits(day),
    page: safePage,
    pageCount,
  })
}

export async function listVisitsForDoctor(doctorId, { day = TODAY } = {}) {
  return delay(filterVisits({ day, doctorId }))
}

export async function getVisit(visitId) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')
  return delay(decorateVisit(visit))
}

export async function createVisit(payload) {
  const doctor = getDoctorRecord(payload.doctorId)
  const patient = getPatientRecord(payload.patientId)
  if (!doctor) throw new Error('Select an available doctor')
  if (!patient) throw new Error('Select a patient')

  const time = payload.time ?? (payload.slot ? slotStart24(payload.slot) : '09:00')
  const date = new Date(`${payload.date}T${time}:00`)
  const visit = {
    id: nextVisitId(),
    patientId: patient.id,
    doctorId: doctor.id,
    date: date.toISOString(),
    type: payload.type ?? 'Appointment',
    status: payload.status ?? 'Upcoming',
    billing: 'Unpaid',
    reason: payload.reason ?? '',
    slot: payload.slot ?? '',
    checkedInAt: payload.status === 'Present' ? new Date().toISOString() : null,
    queue: null,
    completedAt: null,
    missReason: '',
    rescheduledFrom: null,
  }

  if (visit.status === 'Present') {
    visit.queue = nextQueueNumber(doctor.id, visit.date)
  }

  db().visits.push(visit)
  return delay(decorateVisit(visit))
}

export async function updateVisit(visitId, patch) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  if (patch.date && (patch.time || patch.slot)) {
    const time = patch.time ?? slotStart24(patch.slot)
    visit.date = new Date(`${patch.date}T${time}:00`).toISOString()
  } else if (patch.date) {
    const previous = new Date(visit.date)
    const next = new Date(`${patch.date}T00:00:00`)
    next.setHours(previous.getHours(), previous.getMinutes(), 0, 0)
    visit.date = next.toISOString()
  }

  if (patch.doctorId) visit.doctorId = patch.doctorId
  if (patch.type) visit.type = patch.type
  if (patch.reason !== undefined) visit.reason = patch.reason
  if (patch.slot !== undefined) visit.slot = patch.slot
  if (patch.billing) visit.billing = patch.billing
  if (patch.status) visit.status = patch.status

  return delay(decorateVisit(visit))
}

export async function deleteVisit(visitId) {
  const before = db().visits.length
  db().visits = db().visits.filter((visit) => visit.id !== visitId)
  return delay(db().visits.length < before)
}

export async function checkInVisit(visitId) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  visit.status = 'Present'
  visit.checkedInAt = new Date().toISOString()
  if (!visit.queue) visit.queue = nextQueueNumber(visit.doctorId, visit.date)

  return delay(decorateVisit(visit))
}

export async function setBilling(visitId, billing) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')
  visit.billing = billing
  return delay(decorateVisit(visit))
}

export function visitCountForDoctorToday(doctorId) {
  return db().visits.filter(
    (visit) => visit.doctorId === doctorId && isToday(visit.date),
  ).length
}
