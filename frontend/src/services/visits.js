import * as mockImpl from './mock/visits'
import * as apiImpl from './api/visits'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  filterVisits,
  countVisits,
  listVisitBoard,
  listVisitsForDoctor,
  getVisit,
  createVisit,
  updateVisit,
  deleteVisit,
  checkInVisit,
  setBilling,
  visitCountForDoctorToday,
} = impl
