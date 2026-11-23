import { db, isToday, isTomorrow, TODAY } from './mockDb'
import { delay } from './http'
import { decorateVisit, getDoctorRecord } from './model'
import { dateKey } from '../utils/format'
import { TIME_SLOTS } from '../utils/constants'
import { pushNotification } from './notifications'

function slotStart24(slot) {
  const [time, suffix] = slot.split(' – ')[0].split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let normalized = hours % 12
  if (suffix === 'PM') normalized += 12
  if (hours === 12 && suffix === 'AM') normalized = 0
  return `${String(normalized).padStart(2, '0')}:${minutes === 0 ? '00' : minutes}`
}

function doctorVisits(doctorId) {
  return db()
    .visits.filter((visit) => visit.doctorId === doctorId)
    .map(decorateVisit)
}

export async function listDoctorCalendar(doctorId) {
  const doctor = getDoctorRecord(doctorId)
  if (!doctor) throw new Error('Doctor not found')

  const visits = doctorVisits(doctorId)

  const upcoming = visits
    .filter((visit) => ['Upcoming', 'Present'].includes(visit.status))
    .filter((visit) => new Date(visit.date) >= new Date(`${TODAY}T00:00:00`))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const history = visits
    .filter((visit) => ['Done', 'Missed', 'Cancelled'].includes(visit.status))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const scheduledToday = visits.filter(
    (visit) => isToday(visit.date) && visit.status !== 'Cancelled',
  ).length
  const tomorrow = visits.filter(
    (visit) => isTomorrow(visit.date) && visit.status === 'Upcoming',
  ).length

  return delay({
    doctor,
    upcoming,
    history,
    stats: {
      scheduledToday,
      tomorrowProjected: tomorrow,
      handshake: '100%',
      historicalTotal: 142,
      nextPatient: upcoming[0] ? `${upcoming[0].patientName} at ${upcoming[0].timeLabel}` : '—',
      firstCheckIn: '08:00 AM',
    },
  })
}

function bookedSlots(doctorId, date) {
  return db()
    .visits.filter(
      (visit) =>
        visit.doctorId === doctorId &&
        dateKey(visit.date) === date &&
        visit.status !== 'Cancelled' &&
        visit.slot,
    )
    .map((visit) => visit.slot)
}

export async function availableSlots(doctorId, date) {
  const day = new Date(`${date}T00:00:00`)
  const weekday = day.getDay()
  if (weekday === 0 || weekday === 6 || date < TODAY) return delay([])

  const taken = bookedSlots(doctorId, date)
  const slots = TIME_SLOTS.filter((slot) => !taken.includes(slot))
  return delay(slots)
}

export async function getAffectedVisits(doctorId, date) {
  const visits = doctorVisits(doctorId)
    .filter((visit) => dateKey(visit.date) === date)
    .filter((visit) => ['Upcoming', 'Present'].includes(visit.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return delay({
    date,
    visits,
    appointments: visits.filter((visit) => visit.type === 'Appointment').length,
    consultations: visits.filter((visit) => visit.type === 'Consultation').length,
  })
}

export async function rescheduleAppointment(visitId, { date, slot, reason }) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  const previous = visit.date
  visit.date = new Date(`${date}T${slotStart24(slot)}:00`).toISOString()
  visit.slot = slot
  visit.status = 'Upcoming'
  visit.reason = reason || visit.reason
  visit.rescheduledFrom = previous

  pushNotification({
    title: `Dr. ${getDoctorRecord(visit.doctorId)?.name.replace(/^Dr\.\s*/, '')} rescheduled appointment`,
    body: `Patient visit ${visit.id} moved to ${slot}`,
    kind: 'action',
    patientId: visit.patientId,
    visitId: visit.id,
    detail: [`Reason: ${reason || 'No reason provided'}`],
  })

  return delay(decorateVisit(visit))
}

export async function cancelAppointment(visitId, { reason }) {
  const visit = db().visits.find((item) => item.id === visitId)
  if (!visit) throw new Error('Visit not found')

  visit.status = 'Cancelled'
  visit.queue = null
  visit.reason = reason || visit.reason
  visit.missReason = reason
  visit.cancelledAt = new Date().toISOString()

  pushNotification({
    title: 'Dr. Thorne cancelled appointment',
    body: `Patient ${visit.patientId} · Visit ${visit.id} cancelled`,
    kind: 'action',
    patientId: visit.patientId,
    visitId: visit.id,
    detail: [`Reason: ${reason || 'No reason provided'}`],
  })

  return delay(decorateVisit(visit))
}

export async function cancelDay({ doctorId, date, reason }) {
  const affected = db().visits.filter(
    (visit) =>
      visit.doctorId === doctorId &&
      dateKey(visit.date) === date &&
      ['Upcoming', 'Present'].includes(visit.status),
  )

  affected.forEach((visit) => {
    visit.status = 'Cancelled'
    visit.queue = null
    visit.cancelledAt = new Date().toISOString()
    visit.missReason = reason
  })

  pushNotification({
    title: 'Entire day cancelled',
    body: `${affected.length} appointments affected on ${date}.`,
    kind: 'high',
    detail: [
      'Reception team roster alert: contact every affected patient immediately.',
      `Reason: ${reason || 'No reason provided'}`,
    ],
  })

  return delay(affected)
}

export async function rescheduleDay({ doctorId, from, to, reason }) {
  const affected = db().visits.filter(
    (visit) =>
      visit.doctorId === doctorId &&
      dateKey(visit.date) === from &&
      ['Upcoming', 'Present'].includes(visit.status),
  )

  affected.forEach((visit) => {
    const previous = new Date(visit.date)
    const next = new Date(`${to}T00:00:00`)
    next.setHours(previous.getHours(), previous.getMinutes(), 0, 0)
    visit.rescheduledFrom = visit.date
    visit.date = next.toISOString()
    visit.status = 'Upcoming'
    visit.queue = null
  })

  const doctor = getDoctorRecord(doctorId)
  pushNotification({
    title: `Dr. ${doctor?.name.replace(/^Dr\.\s*/, '')} rescheduled an entire day`,
    body: `${affected.length} visits moved to ${to}.`,
    kind: 'action',
    detail: [`Reason: ${reason || 'No reason provided'}`],
  })

  return delay(affected)
}

export { slotStart24 }
