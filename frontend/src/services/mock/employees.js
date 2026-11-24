import { db, STAFF } from '../mockDb'
import { delay } from '../http'

function receptionist() {
  return {
    id: STAFF.receptionist.id,
    ref: 'E-014',
    name: STAFF.receptionist.name,
    role: 'receptionist',
    email: STAFF.receptionist.email,
    phone: STAFF.receptionist.phone,
    room: STAFF.receptionist.workLocation,
    startDay: 'monday',
    endDay: 'friday',
    present: STAFF.receptionist.presence === 'Present',
    availability: STAFF.receptionist.presence,
  }
}

function doctors() {
  return db().doctors.map((doctor) => ({
    id: doctor.id,
    ref: doctor.id,
    name: doctor.name,
    role: 'doctor',
    email: `${doctor.id.toLowerCase()}@curapulse.health`,
    phone: '',
    room: doctor.room,
    startDay: 'monday',
    endDay: 'friday',
    present: doctor.present,
    availability: doctor.present ? 'Present' : 'Absent',
  }))
}

function all() {
  return [receptionist(), ...doctors()]
}

export async function listEmployees({ role } = {}) {
  return delay(all().filter((employee) => (role ? employee.role === role : true)))
}

export async function getEmployee(employeeId) {
  const employee = all().find((item) => item.id === employeeId)
  if (!employee) throw new Error('Employee not found')
  return delay(employee)
}

export async function getEmployeeAvailability(employeeId) {
  return getEmployee(employeeId)
}

export async function updateEmployeeAvailability(employeeId, available) {
  const next = typeof available === 'string' ? available : available ? 'Present' : 'Absent'
  if (employeeId === STAFF.receptionist.id) {
    STAFF.receptionist.presence = next
  } else {
    const doctor = db().doctors.find((item) => item.id === employeeId)
    if (doctor) doctor.present = next === 'Present'
  }
  return delay(await getEmployeeAvailability(employeeId))
}
