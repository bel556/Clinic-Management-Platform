import { apiFetch, apiFetchSafe } from '../http'
import { toId } from '../config'
import {
  billingToApi,
  slotStart24,
  sortVisits,
  statusToApi,
  toVisit,
  toVisitDto,
} from '../adapters'
import { todayKey } from '../../utils/format'

/** Small cache so the sync helpers (filterVisits / countVisits) keep working. */
let boardCache = { day: todayKey(), rows: [] }

function sameDay(visit, day) {
  return visit.dayKey === day
}

export function filterVisits({
  status = 'all',
  query = '',
  doctorId = 'all',
  day = todayKey(),
} = {}) {
  const needle = query.trim().toLowerCase()

  return sortVisits(
    boardCache.rows
      .filter((visit) => sameDay(visit, day))
      .filter((visit) => (status === 'all' ? true : visit.status === status))
      .filter((visit) => (doctorId === 'all' ? true : String(visit.doctorId) === String(doctorId)))
      .filter((visit) => {
        if (!needle) return true
        return (
          visit.patientName.toLowerCase().includes(needle) ||
          (visit.patientRef ?? '').toLowerCase().includes(needle) ||
          String(visit.patientId).includes(needle) ||
          (visit.ref ?? '').toLowerCase().includes(needle) ||
          String(visit.id).includes(needle) ||
          visit.doctorName.toLowerCase().includes(needle)
        )
      }),
  )
}

export function countVisits(day = todayKey()) {
  const rows = boardCache.rows.filter((visit) => sameDay(visit, day))
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
  day = todayKey(),
} = {}) {
  const rows = await apiFetchSafe(`/visits/by-date/${encodeURIComponent(day)}`)
  boardCache = { day, rows: (rows ?? []).map((dto) => toVisit(dto)) }

  const filtered = filterVisits({ status, query, doctorId, day })
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)

  return {
    rows: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    total: filtered.length,
    counts: countVisits(day),
    page: safePage,
    pageCount,
  }
}

export async function listVisitsForDoctor(doctorId, { day = todayKey() } = {}) {
  const payload = await apiFetchSafe(
    `/doctors/${encodeURIComponent(toId(doctorId))}/visits?visit_day=${encodeURIComponent(day)}`,
    {},
    { visits: [] },
  )
  return (payload?.visits ?? []).map((dto) => toVisit(dto))
}

export async function getVisit(visitId) {
  return toVisit(await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}`))
}

export async function createVisit(payload) {
  return toVisit(await apiFetch('/visits', { method: 'POST', body: toVisitDto(payload) }))
}

export async function updateVisit(visitId, patch) {
  const body = {}
  if (patch.visit_date) {
    body.visit_date = patch.visit_date
  } else if (patch.date) {
    const time = patch.time ?? (patch.slot ? slotStart24(patch.slot) : null)
    body.visit_date = time ? `${patch.date}T${time}:00` : `${patch.date}T00:00:00`
  }
  if (patch.doctorId !== undefined && patch.doctorId !== '') body.doctor_id = atoi(patch.doctorId)
  if (patch.type) body.visit_type = patch.type
  if (patch.status) body.status = statusToApi(patch.status)
  if (patch.billing) body.financial_status = billingToApi(patch.billing)
  if (patch.reason !== undefined) body.reason = patch.reason?.trim() || null
  if (patch.slot) body.slot = patch.slot

  return toVisit(
    await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}`, {
      method: 'PATCH',
      body,
    }),
  )
}

export async function deleteVisit(visitId) {
  // The backend has no DELETE /visits route; cancellation is the supported path.
  await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}/cancel`, { method: 'PATCH' })
  return true
}

export async function checkInVisit(visitId) {
  // The PATCH response is the joined visit, including its new queue position.
  return updateVisit(visitId, { status: 'Present' })
}

export async function setBilling(visitId, billing) {
  return updateVisit(visitId, { billing })
}

export async function visitCountForDoctorToday(doctorId) {
  const rows = await listVisitsForDoctor(doctorId, { day: todayKey() })
  return rows.filter((visit) => visit.status !== 'Cancelled').length
}

function atoi(value) {
  return Number.isFinite(Number(value)) ? Number(value) : value
}
