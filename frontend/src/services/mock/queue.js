import { db, isToday, nextNoteId } from '../mockDb'
import { delay } from '../http'
import {
  decorateVisit,
  getDoctorRecord,
  getPatientRecord,
  noteForVisit,
  patientFullName,
  sortVisitsByDate,
} from '../model'

export async function getDoctorQueue(doctorId) {
  const doctor = getDoctorRecord(doctorId)
  if (!doctor) throw new Error('Doctor not found')

  const waiting = sortVisitsByDate(
    db()
      .visits.filter(
        (visit) =>
          visit.doctorId === doctorId &&
          visit.status === 'Present' &&
          isToday(visit.date),
      )
      .map(decorateVisit),
  )

  const today = db().visits.filter(
    (visit) => visit.doctorId === doctorId && isToday(visit.date),
  )
  const done = today.filter((visit) => visit.status === 'Done').length

  return delay({
    doctor,
    queue: waiting,
    stats: {
      waiting: waiting.length,
      done,
      capacity: today.length,
      processed: done,
    },
  })
}

export async function getConsultation(visitId) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  const decorated = decorateVisit(visit)
  const patient = getPatientRecord(visit.patientId)
  const draft = noteForVisit(visitId, { draft: true })

  const previous = db()
    .visits.filter(
      (item) =>
        item.patientId === visit.patientId &&
        item.id !== visitId &&
        item.status === 'Done',
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0]

  const previousNote = previous ? noteForVisit(previous.id) : null
  const previousVisit = previous ? decorateVisit(previous) : null

  return delay({
    visit: decorated,
    patient: { ...patient, fullName: patientFullName(patient) },
    draft,
    previousEncounter: previousVisit
      ? {
          visit: previousVisit,
          content: previousNote?.content ?? 'No clinical notes recorded for this visit.',
        }
      : null,
    allergyList: patient?.allergies ?? [],
    conditionList: patient?.conditions ?? [],
  })
}

function upsertNote(visitId, content, { draft }) {
  const existing = db().medicalNotes.find(
    (note) => note.visitId === visitId && Boolean(note.draft) === Boolean(draft),
  )

  if (existing) {
    existing.content = content
    existing.createdAt = new Date().toISOString()
    return existing
  }

  const note = {
    id: nextNoteId(),
    visitId,
    content,
    createdAt: new Date().toISOString(),
    draft,
  }
  db().medicalNotes.push(note)
  return note
}

export async function saveDraft(visitId, content) {
  const note = upsertNote(visitId, content, { draft: true })
  return delay(note)
}

export async function markVisitDone(visitId, content = '') {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  if (content.trim()) upsertNote(visitId, content.trim(), { draft: false })
  db().medicalNotes = db().medicalNotes.filter(
    (note) => !(note.visitId === visitId && note.draft),
  )

  visit.status = 'Done'
  visit.completedAt = new Date().toISOString()
  visit.queue = null

  return delay(decorateVisit(visit))
}

export async function markVisitMissed(visitId, reason) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  visit.status = 'Missed'
  visit.missReason = reason
  visit.queue = null

  return delay(decorateVisit(visit))
}

export async function keepVisitInQueue(visitId) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')
  return delay(decorateVisit(visit))
}

export async function getPatientTimeline(patientId) {
  const visits = db()
    .visits.filter((visit) => visit.patientId === patientId)
    .map(decorateVisit)

  const notes = db()
    .medicalNotes.filter((note) => !note.draft)
    .map((note) => {
      const visit = visits.find((item) => item.id === note.visitId)
      return visit ? { ...note, visit } : null
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.visit.date) - new Date(a.visit.date))

  return delay({ patient: getPatientRecord(patientId), visits, notes })
}
