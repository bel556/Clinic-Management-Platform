import { apiFetch, apiFetchSafe } from '../http'
import { toId } from '../config'
import {
  toPatient,
  toPatientDto,
  toPatientUpdateDto,
  toVisit,
  sortVisits,
} from '../adapters'

const RECENT_KEY = 'cmp.recentlySearched'

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeRecent(ids) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids))
  } catch {
    /* storage unavailable — recents are best-effort */
  }
}

export function matchPatient(patient, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return false
  const name = (patient.fullName ?? '').toLowerCase()
  return (
    String(patient.id).includes(needle) ||
    (patient.ref ?? '').toLowerCase().includes(needle) ||
    name.includes(needle) ||
    (patient.phone ?? '').toLowerCase().includes(needle) ||
    (patient.email ?? '').toLowerCase().includes(needle)
  )
}

export function searchPatientsSync() {
  return []
}

export async function searchPatients(query, limit = 20) {
  if (!query?.trim()) return []
  const rows = await apiFetchSafe(`/patients/search/${encodeURIComponent(query.trim())}`)
  return (rows ?? []).slice(0, limit).map(toPatient)
}

export async function listPatientDirectory() {
  const [rows, ...searchedRows] = await Promise.all([
    apiFetch('/patients?limit=200&offset=0'),
    ...readRecent().map((id) =>
      apiFetchSafe(`/patients/${encodeURIComponent(id)}`, {}, null),
    ),
  ])
  const patients = (rows ?? []).map(toPatient)
  const recent = [...patients]
    .sort((a, b) => new Date(b.registeredAt ?? 0) - new Date(a.registeredAt ?? 0))
    .slice(0, 4)
  const searched = searchedRows.filter(Boolean).map(toPatient)

  return { patients, recent, searched }
}

export async function getPatient(patientId) {
  const data = await apiFetch(`/patients/${encodeURIComponent(toId(patientId))}/overview`)
  const patient = toPatient(data.patient)

  const toView = (visit) => toVisit(visit, { patient })
  const upcoming = sortVisits((data.upcoming ?? []).map(toView))
  const past = sortVisits((data.history ?? []).map(toView), 'desc')

  return {
    ...patient,
    visits: [...upcoming, ...past],
    upcoming,
    past,
    lastVisit: past[0] ?? null,
  }
}

export async function createPatient(payload) {
  const created = await apiFetch('/patients', { method: 'POST', body: toPatientDto(payload) })
  rememberPatient(created?.patient_id)
  return toPatient(created)
}

export async function updatePatient(patientId, payload) {
  const updated = await apiFetch(`/patients/${encodeURIComponent(toId(patientId))}`, {
    method: 'PATCH',
    body: toPatientUpdateDto(payload),
  })
  return toPatient(updated)
}

export function rememberPatient(patientId) {
  if (patientId === null || patientId === undefined) return
  const recent = readRecent().filter((id) => String(id) !== String(patientId))
  writeRecent([String(patientId), ...recent].slice(0, 4))
}

export async function getPatientHistory(patientId) {
  const patient = await getPatient(patientId)
  const visits = sortVisits(patient.visits ?? [], 'desc')

  const entries = (
    await Promise.all(
      visits.map(async (visit) => {
        const notes = await apiFetchSafe(`/visits/${encodeURIComponent(visit.id)}/notes`)
        return { visit, notes: (notes ?? []).filter((note) => !note.is_draft) }
      }),
    )
  )
    .filter((entry) => entry.notes.length > 0)
    .sort((a, b) => new Date(b.visit.date) - new Date(a.visit.date))

  return { patient, entries, visits }
}
