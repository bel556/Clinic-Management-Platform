import * as mockImpl from './mock/appointments'
import * as apiImpl from './api/appointments'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  listDoctorCalendar,
  availableSlots,
  getAffectedVisits,
  rescheduleAppointment,
  cancelAppointment,
  cancelDay,
  rescheduleDay,
  slotStart24,
} = impl
