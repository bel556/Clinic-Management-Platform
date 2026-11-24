import * as mockImpl from './mock/employees'
import * as apiImpl from './api/employees'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  listEmployees,
  getEmployee,
  getEmployeeAvailability,
  updateEmployeeAvailability,
} = impl
