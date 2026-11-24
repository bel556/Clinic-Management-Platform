import * as mockImpl from './mock/patients'
import * as apiImpl from './api/patients'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  matchPatient,
  searchPatientsSync,
  searchPatients,
  listPatientDirectory,
  getPatient,
  createPatient,
  updatePatient,
  rememberPatient,
  getPatientHistory,
} = impl
