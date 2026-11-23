import { db, isToday } from './mockDb'
import { delay } from './http'
import { getDoctorRecord } from './model'

export const AVAILABILITY_SLOTS = [
  '08:30 AM',
  '09:30 AM',
  '10:30 AM',
  '11:30 AM',
  '12:30 PM',
  '01:30 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM',
]

export const AVAILABILITY_DAYS = [
  { key: 'Mon 28', label: 'MON 28', date: '2024-10-28' },
  { key: 'Tue 29', label: 'TUE 29', date: '2024-10-29' },
  { key: 'Wed 30', label: 'WED 30', date: '2024-10-30' },
  { key: 'Thu 31', label: 'THU 31', date: '2024-10-31' },
  { key: 'Fri 01', label: 'FRI 01', date: '2024-11-01' },
]

function queueCountFor(doctorId) {
  return db().visits.filter(
    (visit) =>
      visit.doctorId === doctorId &&
      visit.status === 'Present' &&
      isToday(visit.date),
  ).length
}

function withQueue(doctor) {
  return { ...doctor, queueCount: queueCountFor(doctor.id) }
}

export async function listDoctors({ query = '' } = {}) {
  const needle = query.trim().toLowerCase()
  const doctors = db()
    .doctors.map(withQueue)
    .filter((doctor) => {
      if (!needle) return true
      return (
        doctor.name.toLowerCase().includes(needle) ||
        doctor.specialty.toLowerCase().includes(needle) ||
        doctor.room.toLowerCase().includes(needle)
      )
    })

  return delay(doctors)
}

export async function getDoctor(doctorId) {
  const doctor = getDoctorRecord(doctorId)
  if (!doctor) throw new Error('Doctor not found')
  return delay(withQueue(doctor))
}

export async function getDoctorAvailability(doctorId) {
  const doctor = getDoctorRecord(doctorId)
  if (!doctor) throw new Error('Doctor not found')

  const doctorIndex = db().doctors.findIndex((item) => item.id === doctorId)

  const cells = AVAILABILITY_DAYS.flatMap((day, dayIndex) =>
    AVAILABILITY_SLOTS.map((slot, slotIndex) => {
      let state = 'Available'
      if (slotIndex === 4) state = 'Clinical recess'
      else if ((doctorIndex + dayIndex * 2 + slotIndex) % 3 === 0) state = 'Booked'
      else if ((doctorIndex + dayIndex + slotIndex) % 7 === 0) state = 'Booked'
      return { dayKey: day.key, slot, state }
    }),
  )

  return delay({ doctor: withQueue(doctor), days: AVAILABILITY_DAYS, slots: AVAILABILITY_SLOTS, cells })
}

export async function updateDoctorAvailability(doctorId, available) {
  const doctor = getDoctorRecord(doctorId)
  if (!doctor) throw new Error('Doctor not found')
  doctor.present = available
  return delay(withQueue(doctor))
}

export async function listPresentDoctors(specialty) {
  const doctors = db()
    .doctors.filter((doctor) => doctor.present)
    .filter((doctor) => (specialty ? doctor.specialty === specialty : true))
    .map(withQueue)
  return delay(doctors)
}

export async function listDoctorSpecialties() {
  return delay([...new Set(db().doctors.map((doctor) => doctor.specialty))])
}
