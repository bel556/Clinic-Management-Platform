/**
 * DTO adapters: FastAPI (snake_case, integer IDs, status enums) → the view
 * models the components already consume (camelCase, labels, "Upcoming" etc.).
 *
 * Every conversion lives here so the mock and api service implementations can
 * keep the exact same exported signatures.
 */
import {
  dateKey,
  doctorRef,
  formatDayShort,
  formatTime,
  now,
  patientRef,
  todayKey,
  visitRef,
} from '../utils/format'

/* ------------------------------------------------------------------ *
 * Visit status vocabulary
 * ------------------------------------------------------------------ */

export const STATUS_FROM_API = {
  scheduled: 'Upcoming',
  upcoming: 'Upcoming',
  checked_in: 'Present',
  present: 'Present',
  completed: 'Done',
  done: 'Done',
  missed: 'Missed',
  absent: 'Missed',
  cancelled: 'Cancelled',
}

export const STATUS_TO_API = {
  Upcoming: 'scheduled',
  Present: 'checked_in',
  Done: 'completed',
  Missed: 'missed',
  Cancelled: 'cancelled',
}

export function statusFromApi(status) {
  return STATUS_FROM_API[String(status ?? '').toLowerCase()] ?? 'Upcoming'
}

export function statusToApi(status) {
  return STATUS_TO_API[status] ?? 'scheduled'
}

export function billingFromApi(value) {
  return String(value ?? '').toLowerCase() === 'paid' ? 'Paid' : 'Unpaid'
}

export function billingToApi(value) {
  return value === 'Paid' ? 'paid' : 'unpaid'
}

/* ------------------------------------------------------------------ *
 * Patients
 * ------------------------------------------------------------------ */

export function splitName(fullName = '') {
  const [firstName, ...rest] = String(fullName).trim().split(/\s+/)
  return { firstName: firstName ?? '', lastName: rest.join(' ') }
}

export function joinName(firstName = '', lastName = '') {
  return `${firstName.trim()} ${lastName.trim()}`.trim()
}

function splitLines(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function joinLines(value) {
  if (Array.isArray(value)) return value.map((line) => line.trim()).filter(Boolean).join('\n') || null
  return String(value ?? '').trim() || null
}

function capitalize(value = '') {
  const text = String(value)
  return text ? text[0].toUpperCase() + text.slice(1).toLowerCase() : ''
}

export function toPatient(dto) {
  if (!dto) return null
  const { patient_id, full_name, birth_date, additional_info, emergency_contact, ...rest } = dto
  const { firstName, lastName } = splitName(full_name)

  return {
    ...rest,
    id: patient_id,
    ref: patientRef(patient_id),
    firstName,
    lastName,
    fullName: full_name ?? joinName(firstName, lastName),
    birthDate: birth_date ?? '',
    gender: capitalize(rest.gender),
    phone: rest.phone ?? '',
    email: rest.email ?? '',
    additionalInfo: additional_info ?? '',
    emergencyContact: emergency_contact ?? '',
    bloodType: rest.blood_type ?? '',
    registeredAt: rest.created_at ?? null,
    allergies: splitLines(rest.allergies),
    conditions: splitLines(rest.conditions),
  }
}

export function toPatientDto(payload) {
  return {
    first_name: payload.firstName?.trim() ?? '',
    last_name: payload.lastName?.trim() ?? '',
    birth_date: payload.birthDate,
    phone: payload.phone?.trim() ?? '',
    gender: payload.gender,
    email: payload.email?.trim() || null,
    additional_info: payload.additionalInfo?.trim() || null,
    emergency_contact: payload.emergencyContact?.trim() || null,
    blood_type: payload.bloodType?.trim() || null,
    allergies: joinLines(payload.allergies),
    conditions: joinLines(payload.conditions),
  }
}

/** PATCH /patients/{id} only accepts these fields (no gender / emergency contact). */
export function toPatientUpdateDto(payload) {
  const dto = {}
  if (payload.firstName !== undefined || payload.lastName !== undefined) {
    dto.first_name = payload.firstName?.trim() ?? ''
    dto.last_name = payload.lastName?.trim() ?? ''
  }
  if (payload.birthDate !== undefined) dto.birth_date = payload.birthDate
  if (payload.phone !== undefined) dto.phone = payload.phone.trim()
  if (payload.gender !== undefined) dto.gender = payload.gender
  if (payload.emergencyContact !== undefined) {
    dto.emergency_contact = payload.emergencyContact.trim() || null
  }
  if (payload.email !== undefined) dto.email = payload.email.trim() || null
  if (payload.additionalInfo !== undefined) {
    dto.additional_info = payload.additionalInfo.trim() || null
  }
  if (payload.bloodType !== undefined) dto.blood_type = payload.bloodType.trim() || null
  if (payload.allergies !== undefined) dto.allergies = joinLines(payload.allergies)
  if (payload.conditions !== undefined) dto.conditions = joinLines(payload.conditions)
  return dto
}

/* ------------------------------------------------------------------ *
 * Doctors
 * ------------------------------------------------------------------ */

export function toDoctor(dto) {
  if (!dto) return null
  const { doctor_id, full_name, room_no, availability_status, start_day, end_day, ...rest } = dto
  const present = String(availability_status ?? '').toLowerCase() === 'present'

  return {
    ...rest,
    id: doctor_id,
    ref: doctorRef(doctor_id),
    name: full_name ?? 'Unassigned doctor',
    specialty: rest.specialty ?? 'General Practice',
    department: rest.specialty ?? 'General Practice',
    employeeId: rest.employee_id ?? null,
    room: room_no ?? rest.room ?? '—',
    present,
    active: present,
    queueCount: Number(rest.queue_count ?? 0),
    slot: `${rest.slot_length_minutes ?? 20} min`,
    npi: rest.npi ?? '',
    license: rest.license_no ?? '',
    email: rest.email ?? '',
    phone: rest.phone ?? '',
    startDay: start_day ?? null,
    endDay: end_day ?? null,
    availability: {},
  }
}

export function toEmployee(dto) {
  if (!dto) return null
  const present = String(dto.availability_status ?? '').toLowerCase() === 'present'
  return {
    id: dto.employee_id,
    ref: `E-${String(dto.employee_id).padStart(3, '0')}`,
    name: dto.full_name ?? 'Unnamed employee',
    role: dto.employee_role ?? 'staff',
    email: dto.email ?? '',
    phone: dto.phone ?? '',
    room: dto.room_no ?? '',
    startDay: dto.start_day ?? null,
    endDay: dto.end_day ?? null,
    present,
    availability: present ? 'Present' : 'Absent',
  }
}

/* ------------------------------------------------------------------ *
 * Visits
 * ------------------------------------------------------------------ */

export function queueLabel(position) {
  return position ? `Q-${String(position).padStart(2, '0')}` : '—'
}

export function toVisit(dto, { doctor = null, patient = null } = {}) {
  if (!dto) return null
  const {
    visit_id,
    patient_id,
    doctor_id,
    visit_date,
    visit_type,
    status,
    financial_status,
    patient_name,
    patient_phone,
    doctor_name,
    specialty,
    position,
    ...rest
  } = dto

  const date = visit_date ?? ''
  const doctorName = doctor_name ?? doctor?.name ?? 'Unassigned doctor'
  const doctorSpecialty = specialty ?? doctor?.specialty ?? ''

  return {
    ...rest,
    id: visit_id,
    ref: visitRef(visit_id),
    patientId: patient_id,
    patientRef: patientRef(patient_id),
    doctorId: doctor_id,
    date,
    type: visit_type ?? 'Appointment',
    status: statusFromApi(status),
    billing: billingFromApi(financial_status),
    queue: position ?? null,
    slot: dto.slot ?? '',
    reason: dto.reason ?? '',
    checkedInAt: dto.checked_in_at ?? null,
    completedAt: dto.completed_at ?? null,
    missReason: '',
    rescheduledFrom: null,
    patient: patient ?? null,
    patientName: patient_name ?? patient?.fullName ?? 'Unknown patient',
    patientPhone: patient_phone ?? patient?.phone ?? '',
    doctorName,
    specialty: doctorSpecialty,
    room: dto.room ?? doctor?.room ?? '',
    timeLabel: formatTime(date),
    dayLabel: formatDayShort(date),
    dayKey: dateKey(date),
    queueLabel: queueLabel(position),
    isToday: dateKey(date) === todayKey(),
  }
}

export function toVisitDto(payload) {
  const time = payload.time ?? (payload.slot ? slotStart24(payload.slot) : '09:00')
  return {
    patient_id: Number(payload.patientId),
    doctor_id: Number(payload.doctorId),
    visit_date: payload.visit_date ?? `${payload.date}T${time}:00`,
    visit_type: payload.type ?? 'Appointment',
    status: statusToApi(payload.status ?? 'Upcoming'),
    financial_status: payload.billing ? billingToApi(payload.billing) : 'unpaid',
    reason: payload.reason?.trim() || null,
    slot: payload.slot || null,
  }
}

export function sortVisits(visits, direction = 'asc') {
  const factor = direction === 'desc' ? -1 : 1
  return [...visits].sort((a, b) => factor * (new Date(a.date) - new Date(b.date)))
}

/** "09:00 AM – 09:30 AM" → "09:00" (24h) */
export function slotStart24(slot) {
  const [time, suffix] = String(slot).split(' – ')[0].split(' ')
  const [hours, minutes] = time.split(':').map(Number)
  let normalized = hours % 12
  if (suffix === 'PM') normalized += 12
  if (hours === 12 && suffix === 'AM') normalized = 0
  return `${String(normalized).padStart(2, '0')}:${minutes === 0 ? '00' : minutes}`
}

export function slotLabelForDate(date, slot) {
  return `${date}T${slotStart24(slot)}:00`
}

/* ------------------------------------------------------------------ *
 * Notifications
 * ------------------------------------------------------------------ */

const NOTIFICATION_KIND = {
  cancelled: 'high',
  missed: 'roster',
}

export function toNotification(dto) {
  if (!dto) return null
  const { notification_id, message, is_read, status, visit_id, visit_date, patient_id, patient_name } = dto
  const text = message ?? ''
  const [first, ...rest] = text.split(/(?<=\.)\s+/)
  const kind = NOTIFICATION_KIND[String(status ?? '').toLowerCase()] ?? 'action'
  const time = dto.notification_created_at ?? dto.notification_date ?? visit_date ?? now().toISOString()

  return {
    ...dto,
    id: notification_id,
    ref: `NT-${String(notification_id).padStart(2, '0')}`,
    kind,
    title: dto.title ?? first ?? text,
    body: dto.body ?? (rest.length ? rest.join(' ') : `${patient_name ?? 'Patient'} · Visit ${visitRef(visit_id)}`),
    detail: dto.detail ?? [],
    time,
    timeLabel: `${formatDayShort(time)} · ${formatTime(time)}`,
    patientId: patient_id ?? null,
    patientName: patient_name ?? null,
    visitId: visit_id ?? null,
    read: Boolean(is_read),
    resolved: Boolean(is_read),
    actionLabel: dto.actionLabel ?? 'Mark as read',
    actionKind: dto.actionKind ?? 'read',
  }
}
