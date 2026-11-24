import { apiFetch } from '../http'
import { toId } from '../config'
import { slotStart24, toDoctor } from '../adapters'
import { TIME_SLOTS } from '../../utils/constants'
import { dateKey } from '../../utils/format'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Availability grid rows use the same start times as the booking form. */
export const AVAILABILITY_SLOTS = [
  ...new Set(TIME_SLOTS.map((slot) => slot.split(' – ')[0])),
]

/** Monday → Friday of the current week, derived from the real clock. */
export function availabilityDays() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
      day.getDate(),
    ).padStart(2, '0')}`
    const label = `${WEEKDAYS[day.getDay()]} ${String(day.getDate()).padStart(2, '0')}`
    return { key: label, label: label.toUpperCase(), date: iso }
  })
}

export const AVAILABILITY_DAYS = availabilityDays()

export async function listDoctors({ query = '' } = {}) {
  const rows = await apiFetch('/doctors/search')
  const needle = query.trim().toLowerCase()

  const doctors = (rows ?? []).map(toDoctor).filter((doctor) => {
    if (!needle) return true
    return (
      doctor.name.toLowerCase().includes(needle) ||
      doctor.specialty.toLowerCase().includes(needle) ||
      doctor.room.toLowerCase().includes(needle)
    )
  })

  return doctors
}

export async function getDoctor(doctorId) {
  const dto = await apiFetch(`/doctors/${encodeURIComponent(toId(doctorId))}`)
  return toDoctor(dto)
}

export async function getDoctorAvailability(doctorId) {
  const days = availabilityDays()
  const first = days[0].date
  const last = days[days.length - 1].date

  const payload = await apiFetch(
    `/doctors/${encodeURIComponent(toId(doctorId))}/availability/week` +
      `?start=${first}&end=${last}`,
  )
  const doctor = toDoctor(payload.doctor)

  const booked = new Set(
    (payload.visits ?? [])
      .filter((visit) => visit.status !== 'cancelled')
      .map((visit) => {
        const when = new Date(visit.visit_date)
        const time = `${String(when.getHours()).padStart(2, '0')}:${String(
          when.getMinutes(),
        ).padStart(2, '0')}`
        return `${dateKey(visit.visit_date)}|${time}`
      }),
  )

  const cells = days.flatMap((day) =>
    AVAILABILITY_SLOTS.map((slot) => ({
      dayKey: day.key,
      slot,
      state: booked.has(`${day.date}|${slotStart24(slot)}`) ? 'Booked' : 'Available',
    })),
  )

  return { doctor, days, slots: AVAILABILITY_SLOTS, cells }
}

export async function updateDoctorAvailability(doctorId, available) {
  const status = available ? 'present' : 'absent'
  await apiFetch(`/doctors/${encodeURIComponent(toId(doctorId))}/availability`, {
    method: 'PATCH',
    body: { status },
  })
  return getDoctor(doctorId)
}

export async function listPresentDoctors(specialty) {
  const params = new URLSearchParams({ only_present: 'true' })
  if (specialty) params.append('specialty', specialty)
  const rows = await apiFetch(`/doctors/search?${params.toString()}`)
  return (rows ?? []).map(toDoctor)
}

export async function listDoctorSpecialties() {
  const rows = await apiFetch('/doctors/search')
  return [...new Set((rows ?? []).map((doctor) => doctor.specialty).filter(Boolean))]
}
