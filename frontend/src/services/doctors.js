import * as mockImpl from './mock/doctors'
import * as apiImpl from './api/doctors'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  AVAILABILITY_SLOTS,
  AVAILABILITY_DAYS,
  listDoctors,
  getDoctor,
  getDoctorAvailability,
  updateDoctorAvailability,
  listPresentDoctors,
  listDoctorSpecialties,
} = impl
