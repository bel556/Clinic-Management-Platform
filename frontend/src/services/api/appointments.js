import { apiFetch, apiFetchSafe } from '../http'
import { toId } from '../config'
import { slotLabelForDate, sortVisits, toVisit } from '../adapters'
import { TIME_SLOTS } from '../../utils/constants'
import { dateKey, formatTime, now, todayKey } from '../../utils/format'
import { getDoctor } from './doctors'

export { slotStart24 } from '../adapters'

function affectedStatuses() {
  return ['Upcoming', 'Present']
}

async function doctorVisits(doctorId) {
  const payload = await apiFetchSafe(
    `/doctors/${encodeURIComponent(toId(doctorId))}/visits`,
    {},
    { visits: [] },
  )
  return (payload?.visits ?? []).map((dto) => toVisit(dto))
}

export async function listDoctorCalendar(doctorId) {
  const [doctor, visits] = await Promise.all([
    getDoctor(doctorId),
    doctorVisits(doctorId),
  ])

  const upcoming = sortVisits(
    visits
      .filter((visit) => affectedStatuses().includes(visit.status))
      .filter((visit) => new Date(visit.date) >= new Date(`${todayKey()}T00:00:00`)),
  )

  const history = sortVisits(
    visits.filter((visit) => ['Done', 'Missed', 'Cancelled'].includes(visit.status)),
    'desc',
  )

  const todays = visits.filter((visit) => dateKey(visit.date) === todayKey())
  const scheduledToday = todays.filter((visit) => visit.status !== 'Cancelled').length
  const completedToday = todays.filter((visit) => visit.status === 'Done').length
  const missedToday = todays.filter((visit) => visit.status === 'Missed').length
  const firstCheckInVisit = todays
    .filter((visit) => visit.checkedInAt)
    .sort((a, b) => new Date(a.checkedInAt) - new Date(b.checkedInAt))[0]

  const next = new Date(now())
  next.setDate(next.getDate() + 1)
  const tomorrow = visits.filter(
    (visit) => dateKey(visit.date) === dateKey(next) && visit.status === 'Upcoming',
  ).length

  return {
    doctor,
    upcoming,
    history,
    stats: {
      scheduledToday,
      completedToday,
      missedToday,
      tomorrowProjected: tomorrow,
      historicalTotal: history.length,
      nextPatient: upcoming[0] ? `${upcoming[0].patientName} at ${upcoming[0].timeLabel}` : '—',
      firstCheckIn: firstCheckInVisit ? formatTime(firstCheckInVisit.checkedInAt) : '—',
    },
  }
}

function slotStartTime(slot) {
  const [time, suffix] = slot.split(' – ')[0].split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let normalized = hours === 12 ? 0 : hours
  if (suffix === 'PM') normalized += 12
  return `${String(normalized).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export async function availableSlots(doctorId, date) {
  const day = new Date(`${date}T00:00:00`)
  if (day.getDay() === 0 || day.getDay() === 6 || date < todayKey()) return []

  const rows = await apiFetchSafe(
    `/doctors/${encodeURIComponent(toId(doctorId))}/visits?visit_day=${encodeURIComponent(date)}`,
    {},
    { visits: [] },
  )

  const taken = (rows?.visits ?? [])
    .filter((visit) => visit.status !== 'cancelled')
    .map((visit) => {
      const when = new Date(visit.visit_date)
      return `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`
    })

  return TIME_SLOTS.filter((slot) => !taken.includes(slotStartTime(slot)))
}

export async function getAffectedVisits(doctorId, date) {
  const visits = (await doctorVisits(doctorId))
    .filter((visit) => dateKey(visit.date) === date)
    .filter((visit) => affectedStatuses().includes(visit.status))
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return {
    date,
    visits,
    appointments: visits.filter((visit) => visit.type === 'Appointment').length,
    consultations: visits.filter((visit) => visit.type === 'Consultation').length,
  }
}

async function patchVisit(visitId, body) {
  return apiFetch(`/visits/${encodeURIComponent(toId(visitId))}`, { method: 'PATCH', body })
}

export async function rescheduleAppointment(visitId, { date, slot, reason }) {
  const body = { visit_date: slotLabelForDate(date, slot), slot }
  if (reason) body.reason = reason
  await patchVisit(visitId, body)

  const updated = await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}`)
  return toVisit(updated)
}

export async function cancelAppointment(visitId, { reason }) {
  const body = { status: 'cancelled' }
  if (reason) body.reason = reason
  await patchVisit(visitId, body)

  const updated = await apiFetch(`/visits/${encodeURIComponent(toId(visitId))}`)
  return toVisit(updated)
}

export async function cancelDay({ doctorId, date, reason }) {
  const { visits } = await getAffectedVisits(doctorId, date)
  await Promise.all(
    visits.map((visit) =>
      patchVisit(visit.id, { status: 'cancelled', reason: reason || null }),
    ),
  )

  return visits
}

export async function rescheduleDay({ doctorId, from, to, reason }) {
  const { visits } = await getAffectedVisits(doctorId, from)

  await Promise.all(
    visits.map((visit) => {
      const previous = new Date(visit.date)
      const next = new Date(`${to}T00:00:00`)
      next.setHours(previous.getHours(), previous.getMinutes(), 0, 0)
      const iso = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(
        next.getDate(),
      ).padStart(2, '0')}T${String(next.getHours()).padStart(2, '0')}:${String(
        next.getMinutes(),
      ).padStart(2, '0')}:00`
      return patchVisit(visit.id, {
        visit_date: iso,
        slot: visit.slot || null,
        reason: reason || null,
      })
    }),
  )

  return visits
}
