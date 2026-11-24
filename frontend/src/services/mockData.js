// ============================================================================
// BACKEND API SPECIFICATION & MOCK DATA SERVICE (Person 1 Scope)
// Dynamic Dates, Automated Missed Visits & Strictly Unique Auto-Incrementing Patient IDs
// ----------------------------------------------------------------------------
// Maps directly to the planned backend service endpoints:
// - api.patients.getAll()              -> GET /api/v1/patients
// - api.patients.getById(id)           -> GET /api/v1/patients/:id
// - api.patients.create(data)          -> POST /api/v1/patients
// - api.patients.update(id, data)      -> PUT /api/v1/patients/:id
// - api.patients.search(query)         -> GET /api/v1/patients/search?q={query}
// - api.patients.getNextId()           -> GET /api/v1/patients/sequence/next-id
// - api.doctors.getAll()               -> GET /api/v1/doctors
// - api.doctors.getById(id)            -> GET /api/v1/doctors/:id
// - api.doctors.getAvailability(id)    -> GET /api/v1/doctors/:id/availability
// - api.visits.getAllVisits()          -> GET /api/v1/visits
// - api.visits.createVisit(data)       -> POST /api/v1/visits
// - api.visits.updateVisit(id, data)   -> PUT /api/v1/visits/:id
// - api.visits.deleteVisit(id)         -> DELETE /api/v1/visits/:id
// - api.visits.checkIn(id)             -> POST /api/v1/visits/:id/check-in
// - api.visits.markAsMissed(id)        -> PATCH /api/v1/visits/:id/status
// - api.visits.printTicket(id)         -> POST /api/v1/visits/:id/print-ticket
// ============================================================================

import {
  getTodayDateString,
  getCurrentWeekDays,
  formatDisplayDate,
  isPastVisitDateTime
} from '../utils/dateTime';

const PATIENTS_STORAGE_KEY = 'curapulse_patients';
const DOCTORS_STORAGE_KEY = 'curapulse_doctors';
const VISITS_STORAGE_KEY = 'curapulse_visits';
const LAST_PATIENT_NUM_KEY = 'curapulse_last_patient_number';

const today = getTodayDateString();
const currentWeek = getCurrentWeekDays();

export const INITIAL_PATIENTS = [
  {
    id: 'P-000108',
    firstName: 'Eleanor',
    lastName: 'Vance',
    gender: 'Female',
    age: 48,
    dateOfBirth: '1978-05-12',
    phone: '+1 (555) 382-9014',
    email: 'eleanor.vance@example.com',
    emergencyContact: 'Marcus Vance (Spouse) • +1 (555) 382-9015',
    additionalInfo: 'Wheelchair assistance needed; bring external lab work panel',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Feb 2021',
    clinicalBaselines: {
      lastRecorded: 'Today',
      knownAllergies: 'Penicillin (Severe cutaneous reaction), Latex (Contact dermatitis)',
      chronicConditions: 'Essential Hypertension (ICD-10 I10), Mild Osteoarthritis (Right Knee)',
      restingBp: '124/82 mmHg',
      heartRate: '71 bpm',
      bmiMetric: '23.8 Normal'
    },
    clinicalNotes: [
      {
        id: 'CN-1',
        date: formatDisplayDate(today),
        doctor: 'Dr. Alexander Thorne',
        specialty: 'Cardiology',
        visitId: 'V-2026-0045',
        type: 'Consultation',
        status: 'Done',
        note: 'Follow-up blood pressure review. Patient reports reduced chest tightness after exertion. Continue prescribed protocol.'
      },
      {
        id: 'CN-2',
        date: '12 Oct 2026',
        doctor: 'Dr. Elena Vance',
        specialty: 'Neurology',
        visitId: 'V-2026-0031',
        type: 'Appointment',
        status: 'Done',
        note: 'Annual assessment completed. Mild hypertension documented. Advised sodium reduction and monitoring at home.'
      }
    ]
  },
  {
    id: 'P-000155',
    firstName: 'Marcus',
    lastName: 'Vance',
    gender: 'Male',
    age: 44,
    dateOfBirth: '1982-03-18',
    phone: '+1 (555) 438-9920',
    email: 'marcus.vance@example.com',
    emergencyContact: 'Eleanor Vance • +1 (555) 382-9014',
    additionalInfo: 'Continuous cardiovascular evaluation.',
    bloodType: 'A+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Mar 2022',
    clinicalBaselines: {
      lastRecorded: 'Today',
      knownAllergies: 'None recorded',
      chronicConditions: 'Mild hypertension',
      restingBp: '128/82 mmHg',
      heartRate: '74 bpm',
      bmiMetric: '24.2 Normal'
    },
    clinicalNotes: []
  },
  {
    id: 'P-000142',
    firstName: 'Elena',
    lastName: 'Rostova',
    gender: 'Female',
    age: 36,
    dateOfBirth: '1990-05-14',
    phone: '+1 (555) 234-8901',
    email: 'elena.rostova@example.com',
    emergencyContact: 'Dmitri Rostov • +1 (555) 234-8900',
    additionalInfo: '',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'May 2022',
    clinicalBaselines: {
      lastRecorded: 'Yesterday',
      knownAllergies: 'None',
      chronicConditions: 'Asthma (Mild intermittent)',
      restingBp: '120/80 mmHg',
      heartRate: '72 bpm',
      bmiMetric: '23.1 Normal'
    },
    clinicalNotes: []
  },
  {
    id: 'P-000154',
    firstName: 'Amina',
    lastName: 'Lin',
    gender: 'Female',
    age: 29,
    dateOfBirth: '1997-07-04',
    phone: '+1 (555) 712-4091',
    email: 'amina.lin@example.com',
    emergencyContact: 'Wei Lin • +1 (555) 712-4090',
    additionalInfo: '',
    bloodType: 'B+ Positive',
    primaryPhysician: 'Dr. M. Lin',
    registeredSince: 'Jan 2023',
    clinicalBaselines: {
      lastRecorded: 'Last week',
      knownAllergies: 'Sulfa drugs',
      chronicConditions: 'None',
      restingBp: '118/76 mmHg',
      heartRate: '68 bpm',
      bmiMetric: '21.5 Normal'
    },
    clinicalNotes: []
  },
  {
    id: 'P-000153',
    firstName: 'David',
    lastName: 'Hayes',
    gender: 'Male',
    age: 61,
    dateOfBirth: '1965-01-12',
    phone: '+1 (555) 309-8812',
    email: 'david.hayes@example.com',
    emergencyContact: 'Sarah Hayes • +1 (555) 309-8811',
    additionalInfo: '',
    bloodType: 'O- Negative',
    primaryPhysician: 'Dr. E. Vance',
    registeredSince: 'Sep 2020',
    clinicalBaselines: {
      lastRecorded: 'Recent',
      knownAllergies: 'Aspirin',
      chronicConditions: 'Type 2 Diabetes',
      restingBp: '132/86 mmHg',
      heartRate: '78 bpm',
      bmiMetric: '27.4 Overweight'
    },
    clinicalNotes: []
  },
  {
    id: 'P-000152',
    firstName: 'Sofia',
    lastName: 'Reyes',
    gender: 'Female',
    age: 34,
    dateOfBirth: '1992-09-22',
    phone: '+1 (555) 911-3049',
    email: 'sofia.reyes@example.com',
    emergencyContact: 'Carlos Reyes • +1 (555) 911-3048',
    additionalInfo: '',
    bloodType: 'AB+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Nov 2021',
    clinicalBaselines: {
      lastRecorded: 'Recent',
      knownAllergies: 'None',
      chronicConditions: 'None',
      restingBp: '115/75 mmHg',
      heartRate: '65 bpm',
      bmiMetric: '22.0 Normal'
    },
    clinicalNotes: []
  },
  {
    id: 'P-000156',
    firstName: 'Nadia',
    lastName: 'Bensaid',
    gender: 'Female',
    age: 32,
    dateOfBirth: '1994-02-18',
    phone: '0555 62 81 04',
    email: 'nadia.bensaid@email.com',
    emergencyContact: 'Karim Bensaid • 0555 62 81 05',
    additionalInfo: 'No additional information',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. Alexander Thorne',
    registeredSince: 'Oct 2024',
    clinicalBaselines: {
      lastRecorded: 'Today',
      knownAllergies: 'None recorded',
      chronicConditions: 'Under evaluation',
      restingBp: '122/80 mmHg',
      heartRate: '70 bpm',
      bmiMetric: '22.5 Normal'
    },
    clinicalNotes: []
  }
];

// Initial shared clinic visits matching Sprint 1 Figma pages
export const INITIAL_VISITS = [
  {
    id: 'V-2026-0046',
    patientId: 'P-000155',
    patientName: 'Marcus Vance',
    slotNumber: '#1',
    time: '08:30 AM',
    date: today,
    dateTime: `${today} 08:30 AM`,
    type: 'Consultation',
    physician: 'Dr. Alexander Thorne · Cardiology',
    doctorName: 'Dr. Alexander Thorne',
    speciality: 'Cardiology',
    reason: 'Clinical notes review and hypertension monitoring',
    status: 'Present',
    queueNumber: 'Q-01',
    billing: 'Paid'
  },
  {
    id: 'V-2026-0045',
    patientId: 'P-000108',
    patientName: 'Eleanor Vance',
    slotNumber: '#2',
    time: '09:00 AM',
    date: today,
    dateTime: `${today} 09:00 AM`,
    type: 'Appointment',
    physician: 'Dr. Alexander Thorne · Cardiology',
    doctorName: 'Dr. Alexander Thorne',
    speciality: 'Cardiology',
    reason: 'Hypertension Quarterly Follow-up',
    status: 'Upcoming',
    queueNumber: null,
    billing: 'Unpaid'
  },
  {
    id: 'V-2026-0042',
    patientId: 'P-000142',
    patientName: 'Elena Rostova',
    slotNumber: '#3',
    time: '09:30 AM',
    date: today,
    dateTime: `${today} 09:30 AM`,
    type: 'Appointment',
    physician: 'Dr. Alexander Thorne · Cardiology',
    doctorName: 'Dr. Alexander Thorne',
    speciality: 'Cardiology',
    reason: 'Cardio screening assessment',
    status: 'Present',
    queueNumber: 'Q-02',
    billing: 'Unpaid'
  },
  {
    id: 'V-2026-0038',
    patientId: 'P-000154',
    patientName: 'Amina Lin',
    slotNumber: '#4',
    time: '10:00 AM',
    date: today,
    dateTime: `${today} 10:00 AM`,
    type: 'Regular',
    physician: 'Dr. Maya Lin · General Practice',
    doctorName: 'Dr. Maya Lin',
    speciality: 'General Practice',
    reason: 'Routine health checkup',
    status: 'Upcoming',
    queueNumber: 'Q-03',
    billing: 'Unpaid'
  },
  {
    id: 'V-2026-0035',
    patientId: 'P-000153',
    patientName: 'David Hayes',
    slotNumber: '#5',
    time: '10:30 AM',
    date: today,
    dateTime: `${today} 10:30 AM`,
    type: 'Appointment',
    physician: 'Dr. Elena Vance · Neurology',
    doctorName: 'Dr. Elena Vance',
    speciality: 'Neurology',
    reason: 'Migraine and neurological screening',
    status: 'Upcoming',
    queueNumber: null,
    billing: 'Paid'
  },
  {
    id: 'V-2026-0032',
    patientId: 'P-000156',
    patientName: 'Nadia Bensaid',
    slotNumber: '#6',
    time: '11:15 AM',
    date: today,
    dateTime: `${today} 11:15 AM`,
    type: 'Consultation',
    physician: 'Dr. Alexander Thorne · Cardiology',
    doctorName: 'Dr. Alexander Thorne',
    speciality: 'Cardiology',
    reason: 'Follow-up consultation and blood pressure review',
    status: 'Upcoming',
    queueNumber: null,
    billing: 'Unpaid'
  },
  {
    id: 'V-2026-0029',
    patientId: 'P-000152',
    patientName: 'Sofia Reyes',
    slotNumber: '#7',
    time: '08:00 AM',
    date: '2026-11-23',
    dateTime: '2026-11-23 08:00 AM',
    type: 'Appointment',
    physician: 'Dr. Alexander Thorne · Cardiology',
    doctorName: 'Dr. Alexander Thorne',
    speciality: 'Cardiology',
    reason: 'Cardiac stress follow-up',
    status: 'Missed',
    queueNumber: null,
    billing: 'Unpaid'
  }
];

export const INITIAL_DOCTORS = [
  {
    id: 'doc-1',
    name: 'Dr. Alexander Thorne',
    title: 'Dr. Alexander Thorne, MD',
    specialty: 'Cardiology',
    department: 'Department of Cardiology',
    room: 'Room 204',
    suite: 'Suite 204',
    schedule: 'Mon-Fri',
    status: 'Present',
    queueCount: 4,
    statusNote: '4 in queue',
    npi: 'NPI-1982401824',
    license: 'MD-NY-492019',
    clinicalAccess: 'ATTENDING / FULL PRESCRIPTIVE',
    email: 'a.thorne@curapulse.health',
    phone: '(555) 234-8901',
    ext: '4082',
    assignedSpace: 'Exam Room 4B',
    consultationSlot: '20 Minutes',
    standardShifts: 'Monday through Friday · 08:30 AM — 04:30 PM',
    availability: {
      week: currentWeek.week,
      days: currentWeek.days,
      timeSlots: [
        { time: '08:30 AM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Booked', THU: 'Available', FRI: 'Available' } },
        { time: '09:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Available', THU: 'Booked', FRI: 'Available' } },
        { time: '10:30 AM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Booked', THU: 'Available', FRI: 'Booked' } },
        { time: '11:30 AM', slots: { MON: 'Available', TUE: 'Available', WED: 'Available', THU: 'Booked', FRI: 'Booked' } },
        { time: '12:30 PM', isRecess: true, label: 'CLINICAL RECESS / ROUNDS' },
        { time: '01:30 PM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Booked', FRI: 'Available' } },
        { time: '02:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Available' } },
        { time: '03:30 PM', slots: { MON: 'Available', TUE: 'Available', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '04:30 PM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Booked', THU: 'Available', FRI: 'Booked' } }
      ]
    }
  },
  {
    id: 'doc-2',
    name: 'Dr. Elena Vance',
    title: 'Dr. Elena Vance, MD',
    specialty: 'Neurology',
    department: 'Department of Neurology',
    room: 'Room 206',
    suite: 'Suite 206',
    schedule: 'Mon-Fri',
    status: 'Present',
    queueCount: 2,
    statusNote: '2 in queue',
    npi: 'NPI-1849102931',
    license: 'MD-NY-381029',
    clinicalAccess: 'ATTENDING / FULL PRESCRIPTIVE',
    email: 'e.vance@curapulse.health',
    phone: '(555) 234-8902',
    ext: '4083',
    assignedSpace: 'Exam Room 2A',
    consultationSlot: '30 Minutes',
    standardShifts: 'Monday through Friday · 09:00 AM — 05:00 PM',
    availability: {
      week: currentWeek.week,
      days: currentWeek.days,
      timeSlots: [
        { time: '08:30 AM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Booked' } },
        { time: '09:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Available', FRI: 'Available' } },
        { time: '10:30 AM', slots: { MON: 'Available', TUE: 'Available', WED: 'Booked', THU: 'Booked', FRI: 'Available' } },
        { time: '11:30 AM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Available', THU: 'Available', FRI: 'Booked' } },
        { time: '12:30 PM', isRecess: true, label: 'CLINICAL RECESS / ROUNDS' },
        { time: '01:30 PM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Booked', THU: 'Booked', FRI: 'Available' } },
        { time: '02:30 PM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Booked' } },
        { time: '03:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Available' } },
        { time: '04:30 PM', slots: { MON: 'Available', TUE: 'Available', WED: 'Booked', THU: 'Booked', FRI: 'Available' } }
      ]
    }
  },
  {
    id: 'doc-3',
    name: 'Dr. Robert Chen',
    title: 'Dr. Robert Chen, MD',
    specialty: 'Pediatrics',
    department: 'Department of Pediatrics',
    room: 'Room 102',
    suite: 'Suite 102',
    schedule: 'Tue-Sat',
    status: 'Absent',
    queueCount: 0,
    statusNote: 'Off roster',
    npi: 'NPI-1729401928',
    license: 'MD-NY-591024',
    clinicalAccess: 'ATTENDING / FULL PRESCRIPTIVE',
    email: 'r.chen@curapulse.health',
    phone: '(555) 234-8903',
    ext: '4084',
    assignedSpace: 'Pediatric Wing 1B',
    consultationSlot: '15 Minutes',
    standardShifts: 'Tuesday through Saturday · 08:00 AM — 04:00 PM',
    availability: {
      week: currentWeek.week,
      days: currentWeek.days,
      timeSlots: [
        { time: '08:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '09:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '10:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '11:30 AM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '12:30 PM', isRecess: true, label: 'CLINICAL RECESS / ROUNDS' },
        { time: '01:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '02:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '03:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } },
        { time: '04:30 PM', slots: { MON: 'Booked', TUE: 'Booked', WED: 'Booked', THU: 'Booked', FRI: 'Booked' } }
      ]
    }
  },
  {
    id: 'doc-4',
    name: 'Dr. Maya Lin',
    title: 'Dr. Maya Lin, MD',
    specialty: 'General Practice',
    department: 'General Practice',
    room: 'Room 105',
    suite: 'Suite 105',
    schedule: 'Mon-Fri',
    status: 'Present',
    queueCount: 1,
    statusNote: '1 in queue',
    npi: 'NPI-1948201723',
    license: 'MD-NY-291830',
    clinicalAccess: 'ATTENDING / FULL PRESCRIPTIVE',
    email: 'm.lin@curapulse.health',
    phone: '(555) 234-8904',
    ext: '4085',
    assignedSpace: 'Clinic Room 105',
    consultationSlot: '20 Minutes',
    standardShifts: 'Monday through Friday · 08:30 AM — 04:30 PM',
    availability: {
      week: currentWeek.week,
      days: currentWeek.days,
      timeSlots: [
        { time: '08:30 AM', slots: { MON: 'Available', TUE: 'Available', WED: 'Available', THU: 'Booked', FRI: 'Available' } },
        { time: '09:30 AM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Booked' } },
        { time: '10:30 AM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Booked', THU: 'Available', FRI: 'Available' } },
        { time: '11:30 AM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Booked', FRI: 'Available' } },
        { time: '12:30 PM', isRecess: true, label: 'CLINICAL RECESS / ROUNDS' },
        { time: '01:30 PM', slots: { MON: 'Available', TUE: 'Available', WED: 'Booked', THU: 'Available', FRI: 'Booked' } },
        { time: '02:30 PM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Available', THU: 'Booked', FRI: 'Available' } },
        { time: '03:30 PM', slots: { MON: 'Available', TUE: 'Booked', WED: 'Available', THU: 'Available', FRI: 'Available' } },
        { time: '04:30 PM', slots: { MON: 'Booked', TUE: 'Available', WED: 'Booked', THU: 'Available', FRI: 'Booked' } }
      ]
    }
  }
];

// ============================================================================
// AUTO-INCREMENTING UNIQUE PATIENT ID GENERATOR
// Guarantees static +1 sequential IDs: P-000157, P-000158, P-000159...
// Prevents duplicate IDs across all created patients
// ============================================================================

export function getNextPatientId() {
  const patients = getStoredPatients();

  // Find the highest numeric index among all existing patient IDs
  let maxNumericId = 156;
  patients.forEach((p) => {
    if (p && p.id) {
      const match = p.id.match(/P-0*(\d+)/i);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxNumericId) {
          maxNumericId = parsed;
        }
      }
    }
  });

  const storedCounter = parseInt(localStorage.getItem(LAST_PATIENT_NUM_KEY), 10);
  const nextNum = Math.max(maxNumericId, !isNaN(storedCounter) ? storedCounter : 156) + 1;

  localStorage.setItem(LAST_PATIENT_NUM_KEY, String(nextNum));
  return `P-000${nextNum}`;
}

// ============================================================================
// VISITS DATA ACCESS & MUTATIONS (WITH MISSED STATUS AUTO-EVALUATION)
// ============================================================================

export function getAllVisits() {
  const data = localStorage.getItem(VISITS_STORAGE_KEY);
  let list = INITIAL_VISITS;
  if (data) {
    try {
      list = JSON.parse(data);
    } catch {
      // fallback
    }
  }

  // Automatic evaluation: If an appointment date & time is < current time
  // and status is still Upcoming/Scheduled (patient did not come), transition to Missed!
  let hasChanges = false;
  const evaluated = list.map((v) => {
    const isUpcoming = v.status?.toLowerCase() === 'upcoming' || v.status?.toLowerCase() === 'scheduled';
    if (isUpcoming && isPastVisitDateTime(v.date || v.dateTime, v.time)) {
      hasChanges = true;
      return {
        ...v,
        status: 'Missed'
      };
    }
    return v;
  });

  if (hasChanges) {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(evaluated));
  } else if (!data) {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(INITIAL_VISITS));
  }

  return evaluated;
}

export function saveAllVisits(visits) {
  localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
  window.dispatchEvent(new CustomEvent('curapulse_visits_updated', { detail: visits }));
}

export function getVisitsByPatientId(patientId) {
  const visits = getAllVisits();
  return visits.filter((v) => v.patientId?.toLowerCase() === patientId?.toLowerCase());
}

export function createVisit(payload) {
  const visits = getAllVisits();
  const nextNum = visits.length + 50;
  const visitId = payload.id || `V-2026-00${nextNum}`;

  let queueNumber = payload.queueNumber || null;
  if (!queueNumber && (payload.type === 'Regular' || payload.status === 'Present')) {
    const presentCount = visits.filter((v) => v.queueNumber).length + 1;
    queueNumber = `Q-${String(presentCount).padStart(2, '0')}`;
  }

  const newVisit = {
    ...payload,
    id: visitId,
    date: payload.date || getTodayDateString(),
    time: payload.time || '10:00 AM',
    dateTime: payload.dateTime || `${payload.date || getTodayDateString()} ${payload.time || '10:00 AM'}`,
    status: payload.status || 'Upcoming',
    billing: payload.billing || 'Unpaid',
    queueNumber
  };

  const updatedVisits = [newVisit, ...visits];
  saveAllVisits(updatedVisits);

  if (payload.patientId) {
    syncPatientVisits(payload.patientId);
  }

  return newVisit;
}

export function updateVisit(visitId, updatedFields) {
  const visits = getAllVisits();
  const idx = visits.findIndex((v) => v.id === visitId);
  if (idx === -1) return null;

  const current = visits[idx];
  const dateVal = updatedFields.date || current.date;
  const timeVal = updatedFields.time || current.time;

  const updated = {
    ...current,
    ...updatedFields,
    date: dateVal,
    time: timeVal,
    dateTime: dateVal && timeVal ? `${dateVal} ${timeVal}` : (updatedFields.dateTime || current.dateTime)
  };

  visits[idx] = updated;
  saveAllVisits(visits);

  if (updated.patientId) {
    syncPatientVisits(updated.patientId);
  }

  return updated;
}

export function deleteVisit(visitId) {
  const visits = getAllVisits();
  const target = visits.find((v) => v.id === visitId);
  const updated = visits.filter((v) => v.id !== visitId);
  saveAllVisits(updated);

  if (target?.patientId) {
    syncPatientVisits(target.patientId);
  }

  return true;
}

export function checkInVisit(visitId) {
  const visits = getAllVisits();
  const idx = visits.findIndex((v) => v.id === visitId);
  if (idx === -1) return null;

  const presentCount = visits.filter((v) => v.queueNumber).length + 1;
  const queueNumber = `Q-${String(presentCount).padStart(2, '0')}`;

  visits[idx] = {
    ...visits[idx],
    status: 'Present',
    queueNumber
  };

  saveAllVisits(visits);

  if (visits[idx].patientId) {
    syncPatientVisits(visits[idx].patientId);
  }

  return visits[idx];
}

export function markVisitAsMissed(visitId) {
  return updateVisit(visitId, { status: 'Missed' });
}

function syncPatientVisits(patientId) {
  const patients = getStoredPatients();
  const pIdx = patients.findIndex((p) => p.id.toLowerCase() === patientId.toLowerCase());
  if (pIdx !== -1) {
    const patientVisits = getVisitsByPatientId(patientId);
    patients[pIdx] = {
      ...patients[pIdx],
      recentVisits: patientVisits
    };
    saveStoredPatients(patients);
  }
}

// ============================================================================
// PATIENTS DATA ACCESS & MUTATIONS
// ============================================================================

export function getStoredPatients() {
  const data = localStorage.getItem(PATIENTS_STORAGE_KEY);
  let list = INITIAL_PATIENTS;

  if (data) {
    try {
      list = JSON.parse(data);
    } catch {
      list = INITIAL_PATIENTS;
    }
  }

  // De-duplicate any patients that might share the same ID in localStorage
  const seenIds = new Set();
  const sanitized = list.map((patient, index) => {
    let currentId = patient.id;
    if (!currentId || seenIds.has(currentId.toLowerCase())) {
      // Reassign static unique ID
      currentId = `P-000${156 + index}`;
    }
    seenIds.add(currentId.toLowerCase());
    return {
      ...patient,
      id: currentId
    };
  });

  const allVisits = getAllVisits();
  const finalized = sanitized.map((p) => ({
    ...p,
    recentVisits: allVisits.filter((v) => v.patientId?.toLowerCase() === p.id.toLowerCase())
  }));

  if (JSON.stringify(list) !== JSON.stringify(sanitized)) {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(finalized));
  } else if (!data) {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(finalized));
  }

  return finalized;
}

export function saveStoredPatients(patients) {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
}

export function getPatientById(id) {
  const patients = getStoredPatients();
  return patients.find((p) => p.id.toLowerCase() === id.toLowerCase()) || null;
}

export function addPatient(patientData) {
  const patients = getStoredPatients();

  // Generate static +1 unique ID (P-000157, P-000158, ...)
  const newId = patientData.id || getNextPatientId();

  let age = patientData.age || 0;
  if (patientData.dateOfBirth) {
    const dob = new Date(patientData.dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    age = Math.abs(ageDt.getUTCFullYear() - 1970) || age;
  }

  const newPatient = {
    ...patientData,
    id: newId,
    age,
    registeredSince: 'Nov 2026',
    clinicalBaselines: patientData.clinicalBaselines || {
      lastRecorded: 'Today',
      knownAllergies: 'None recorded',
      chronicConditions: 'None recorded',
      restingBp: '120/80 mmHg',
      heartRate: '72 bpm',
      bmiMetric: '22.0 Normal'
    },
    recentVisits: [],
    clinicalNotes: []
  };

  const updated = [newPatient, ...patients];
  saveStoredPatients(updated);
  return newPatient;
}

export function updatePatient(id, updatedFields) {
  const patients = getStoredPatients();
  const index = patients.findIndex((p) => p.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  patients[index] = { ...patients[index], ...updatedFields };
  saveStoredPatients(patients);
  return patients[index];
}

// ============================================================================
// DOCTORS DATA ACCESS & MUTATIONS
// ============================================================================

export function getStoredDoctors() {
  const data = localStorage.getItem(DOCTORS_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(INITIAL_DOCTORS));
  return INITIAL_DOCTORS;
}

export function getDoctorById(id) {
  const doctors = getStoredDoctors();
  return doctors.find((d) => d.id === id) || doctors[0];
}

export function toggleDoctorSlot(doctorId, dayKey, timeStr) {
  const doctors = getStoredDoctors();
  const doc = doctors.find((d) => d.id === doctorId);
  if (!doc) return null;

  const timeSlot = doc.availability.timeSlots.find((ts) => ts.time === timeStr);
  if (timeSlot && timeSlot.slots && timeSlot.slots[dayKey]) {
    timeSlot.slots[dayKey] = timeSlot.slots[dayKey] === 'Available' ? 'Booked' : 'Available';
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  }
  return doc;
}
