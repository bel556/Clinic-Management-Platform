import { apiFetch, apiFetchSafe } from '../http'
import { toId } from '../config'
import { sortVisits, toDoctor, toPatient, toVisit } from '../adapters'
import { getDoctor } from './doctors'
import { getVisit, updateVisit } from './visits'
import { getPatient } from './patients'

function draftNote(notes) {
  return (notes ?? []).find((note) => Boolean(note.is_draft)) ?? null
}

async function fetchNotes(visitId) {
  return (
    (await apiFetchSafe(`/visits/${encodeURIComponent(toId(visitId))}/notes`, {}, [])) ?? []
  )
}

function mapConsultation(data) {
  if (!data) return null
  const visit = toVisit(data.visit)
  const patient = toPatient(data.patient)
  const notes = data.notes ?? []
  return {
    visit,
    patient,
    notes,
    draft: notes.find((note) => note.is_draft) ?? null,
    previousEncounter: data.previous_encounter
      ? {
          visit: toVisit(data.previous_encounter.visit),
          content: data.previous_encounter.content,
        }
      : null,
    allergyList: patient?.allergies ?? [],
    conditionList: patient?.conditions ?? [],
  }
}

export async function getDoctorQueue(doctorId) {
  const payload = await apiFetch(
    `/doctors/${encodeURIComponent(toId(doctorId))}/queue?include_consultation=true`,
  )
  const queue = sortVisits((payload?.queue ?? []).map((dto) => toVisit(dto)))
  const done = Number(payload?.completed_today ?? 0)

  return {
    doctor: payload?.doctor ? toDoctor(payload.doctor) : await getDoctor(doctorId),
    queue,
    stats: {
      waiting: queue.length,
      done,
      capacity: Number(payload?.total_today ?? 0),
      processed: done,
    },
    initialConsultation: mapConsultation(payload?.initial_consultation),
  }
}

export async function getConsultation(visitId) {
  const data = await apiFetch(
    `/visits/${encodeURIComponent(toId(visitId))}/consultation`,
  )
  return mapConsultation(data)
}

export async function saveDraft(visitId, content) {
  const id = encodeURIComponent(toId(visitId))
  const existing = draftNote(await fetchNotes(visitId))

  if (existing) {
    return apiFetch(`/medical-notes/${encodeURIComponent(existing.note_id)}`, {
      method: 'PATCH',
      body: { content, is_draft: true },
    })
  }

  return apiFetch(`/visits/${id}/notes`, {
    method: 'POST',
    body: { content, is_draft: true },
  })
}

export async function markVisitDone(visitId, content = '') {
  const trimmed = content.trim()
  if (trimmed) {
    const notes = await fetchNotes(visitId)
    const existing = draftNote(notes)

    if (existing) {
      await apiFetch(`/medical-notes/${encodeURIComponent(existing.note_id)}`, {
        method: 'PATCH',
        body: { content: trimmed, is_draft: false },
      })
    } else {
      await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}/notes`, {
        method: 'POST',
        body: { content: trimmed },
      })
    }
  }

  return updateVisit(visitId, { status: 'Done' })
}

export async function markVisitMissed(visitId) {
  return updateVisit(visitId, { status: 'Missed' })
}

export async function keepVisitInQueue(visitId) {
  return getVisit(visitId)
}

export async function getPatientTimeline(patientId) {
  const patient = await getPatient(patientId)
  const visits = sortVisits(patient.visits ?? [], 'desc')

  const notes = (
    await Promise.all(
      visits.map(async (visit) => {
        const rows = await fetchNotes(visit.id)
        return rows
          .filter((note) => !note.is_draft)
          .map((note) => ({ ...note, visit }))
      }),
    )
  )
    .flat()
    .sort((a, b) => new Date(b.visit.date) - new Date(a.visit.date))

  return { patient, visits, notes }
}
