import * as mockImpl from './mock/queue'
import * as apiImpl from './api/queue'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  getDoctorQueue,
  getConsultation,
  saveDraft,
  markVisitDone,
  markVisitMissed,
  keepVisitInQueue,
  getPatientTimeline,
} = impl
