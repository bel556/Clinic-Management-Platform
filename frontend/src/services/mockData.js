// ============================================================================
// BACKEND API SPECIFICATION & MOCK DATA SERVICE (Person 1 Scope)
// ----------------------------------------------------------------------------
// Maps directly to the planned backend service endpoints:
// - api.patients.getAll()              -> GET /api/v1/patients
// - api.patients.getById(id)           -> GET /api/v1/patients/:id
// - api.patients.create(data)          -> POST /api/v1/patients
// - api.patients.update(id, data)      -> PUT /api/v1/patients/:id
// - api.patients.search(query)         -> GET /api/v1/patients/search?q={query}
// - api.doctors.getAll()               -> GET /api/v1/doctors
// - api.doctors.getById(id)            -> GET /api/v1/doctors/:id
// - api.doctors.getAvailability(id)    -> GET /api/v1/doctors/:id/availability
// - api.visits.createVisit(data)       -> POST /api/v1/visits
// - api.visits.deleteVisit(id)         -> DELETE /api/v1/visits/:id
// - api.visits.printTicket(id)         -> POST /api/v1/visits/:id/print-ticket
// ============================================================================

export const INITIAL_PATIENTS = [
  {
    id: 'P-000108',
    firstName: 'Eleanor',
    lastName: 'Vance',
    gender: 'Female',
    age: 48,
    dateOfBirth: '1976-05-12',
    phone: '+1 (555) 382-9014',
    email: 'eleanor.vance@example.com',
    emergencyContact: 'Marcus Vance (Spouse) • +1 (555) 382-9015',
    additionalInfo: 'Wheelchair assistance needed; bring external lab work panel',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Feb 2021',
    clinicalBaselines: {
      lastRecorded: 'Oct 24, 2024',
      knownAllergies: 'Penicillin (Severe cutaneous reaction), Latex (Contact dermatitis)',
      chronicConditions: 'Essential Hypertension (ICD-10 I10), Mild Osteoarthritis (Right Knee)',
      restingBp: '124/82 mmHg',
      heartRate: '71 bpm',
      bmiMetric: '23.8 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0045',
        dateTime: 'Oct 30, 2024 10:30 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Hypertension Quarterly Follow-up',
        status: 'Scheduled',
        billing: 'Unpaid'
      },
      {
        id: 'V-2024-0038',
        dateTime: 'Aug 14, 2024 02:15 PM',
        physician: 'Dr. Elena Rostova · Orthopedics',
        reason: 'Right Knee Joint Assessment',
        status: 'Completed',
        billing: 'Paid'
      },
      {
        id: 'V-2024-0025',
        dateTime: 'May 02, 2024 09:00 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Annual Routine Physical',
        status: 'Completed',
        billing: 'Paid'
      },
      {
        id: 'V-2024-0012',
        dateTime: 'Jan 18, 2024 11:45 AM',
        physician: 'Dr. Marcus Chen · Internal Medicine',
        reason: 'Acute Bronchitis Evaluation',
        status: 'Completed',
        billing: 'Paid'
      }
    ],
    clinicalNotes: [
      {
        id: 'CN-1',
        date: '24 Oct 2024',
        doctor: 'Dr. Alexander Thorne',
        specialty: 'Cardiology',
        visitId: 'V-2024-0039',
        type: 'Consultation',
        status: 'Done',
        note: 'Follow-up blood pressure review. Patient reports reduced chest tightness after exertion. Continue the prescribed plan and review in 3 months.'
      },
      {
        id: 'CN-2',
        date: '12 Oct 2024',
        doctor: 'Dr. Elena Vance',
        specialty: 'Neurology',
        visitId: 'V-2024-0031',
        type: 'Appointment',
        status: 'Done',
        note: 'Annual assessment completed. Mild hypertension documented. Advised sodium reduction, regular cardiovascular activity and monitoring at home.'
      },
      {
        id: 'CN-3',
        date: '14 Aug 2024',
        doctor: 'Dr. Maya Lin',
        specialty: 'General Practice',
        visitId: 'V-2024-0018',
        type: 'Regular',
        status: 'Done',
        note: 'Routine review. Medication history checked and recorded. Patient advised to bring previous laboratory results to the next consultation.'
      }
    ]
  },
  {
    id: 'P-000155',
    firstName: 'Marcus',
    lastName: 'Vance',
    gender: 'Male',
    age: 44,
    dateOfBirth: '1980-03-18',
    phone: '+1 (555) 438-9920',
    email: 'marcus.vance@example.com',
    emergencyContact: 'Eleanor Vance • +1 (555) 382-9014',
    additionalInfo: 'Advising continuous sodium reduction.',
    bloodType: 'A+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Mar 2022',
    clinicalBaselines: {
      lastRecorded: 'Oct 28, 2024',
      knownAllergies: 'None recorded',
      chronicConditions: 'Mild hypertension',
      restingBp: '128/82 mmHg',
      heartRate: '74 bpm',
      bmiMetric: '24.2 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0046',
        dateTime: 'Oct 28, 2024 09:30 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Consultation & Clinical Notes',
        status: 'Scheduled',
        billing: 'Paid'
      }
    ]
  },
  {
    id: 'P-000154',
    firstName: 'Amina',
    lastName: 'Lin',
    gender: 'Female',
    age: 29,
    dateOfBirth: '1995-07-04',
    phone: '+1 (555) 712-4091',
    email: 'amina.lin@example.com',
    emergencyContact: 'Wei Lin • +1 (555) 712-4090',
    additionalInfo: '',
    bloodType: 'B+ Positive',
    primaryPhysician: 'Dr. M. Lin',
    registeredSince: 'Jan 2023',
    clinicalBaselines: {
      lastRecorded: 'Oct 15, 2024',
      knownAllergies: 'Sulfa drugs',
      chronicConditions: 'None',
      restingBp: '118/76 mmHg',
      heartRate: '68 bpm',
      bmiMetric: '21.5 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0029',
        dateTime: 'Oct 18, 2024 09:00 AM',
        physician: 'Dr. Maya Lin · General Practice',
        reason: 'Routine Health Checkup',
        status: 'Completed',
        billing: 'Paid'
      }
    ]
  },
  {
    id: 'P-000153',
    firstName: 'David',
    lastName: 'Hayes',
    gender: 'Male',
    age: 61,
    dateOfBirth: '1963-01-12',
    phone: '+1 (555) 309-8812',
    email: 'david.hayes@example.com',
    emergencyContact: 'Sarah Hayes • +1 (555) 309-8811',
    additionalInfo: '',
    bloodType: 'O- Negative',
    primaryPhysician: 'Dr. E. Vance',
    registeredSince: 'Sep 2020',
    clinicalBaselines: {
      lastRecorded: 'Oct 22, 2024',
      knownAllergies: 'Aspirin',
      chronicConditions: 'Type 2 Diabetes',
      restingBp: '132/86 mmHg',
      heartRate: '78 bpm',
      bmiMetric: '27.4 Overweight'
    },
    recentVisits: [
      {
        id: 'V-2024-0035',
        dateTime: 'Oct 22, 2024 11:30 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Cardiac Stress Assessment',
        status: 'Missed',
        billing: 'Unpaid'
      }
    ]
  },
  {
    id: 'P-000152',
    firstName: 'Sofia',
    lastName: 'Reyes',
    gender: 'Female',
    age: 34,
    dateOfBirth: '1990-09-22',
    phone: '+1 (555) 911-3049',
    email: 'sofia.reyes@example.com',
    emergencyContact: 'Carlos Reyes • +1 (555) 911-3048',
    additionalInfo: '',
    bloodType: 'AB+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'Nov 2021',
    clinicalBaselines: {
      lastRecorded: 'Oct 21, 2024',
      knownAllergies: 'None',
      chronicConditions: 'None',
      restingBp: '115/75 mmHg',
      heartRate: '65 bpm',
      bmiMetric: '22.0 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0032',
        dateTime: 'Oct 21, 2024 09:00 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Follow-up Consultation',
        status: 'Completed',
        billing: 'Paid'
      }
    ]
  },
  {
    id: 'P-000142',
    firstName: 'Elena',
    lastName: 'Rostova',
    gender: 'Female',
    age: 36,
    dateOfBirth: '1988-05-14',
    phone: '+1 (555) 234-8901',
    email: 'elena.rostova@example.com',
    emergencyContact: 'Dmitri Rostov • +1 (555) 234-8900',
    additionalInfo: '',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. A. Thorne',
    registeredSince: 'May 2022',
    clinicalBaselines: {
      lastRecorded: 'Oct 23, 2024',
      knownAllergies: 'None',
      chronicConditions: 'Asthma (Mild intermittent)',
      restingBp: '120/80 mmHg',
      heartRate: '72 bpm',
      bmiMetric: '23.1 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0038',
        dateTime: 'Oct 23, 2024 02:30 PM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Cardio Screening',
        status: 'Completed',
        billing: 'Unpaid'
      }
    ]
  },
  {
    id: 'P-000139',
    firstName: 'Elena',
    lastName: 'Solis-Gomez',
    gender: 'Female',
    age: 30,
    dateOfBirth: '1994-08-29',
    phone: '+1 (555) 892-1144',
    email: 'elena.sg@example.com',
    emergencyContact: 'Mateo Gomez • +1 (555) 892-1140',
    additionalInfo: '',
    bloodType: 'A- Negative',
    primaryPhysician: 'Dr. R. Chen',
    registeredSince: 'Jun 2023',
    clinicalBaselines: {
      lastRecorded: 'Sep 10, 2024',
      knownAllergies: 'Latex',
      chronicConditions: 'None',
      restingBp: '112/70 mmHg',
      heartRate: '64 bpm',
      bmiMetric: '20.8 Normal'
    },
    recentVisits: []
  },
  {
    id: 'PT-84291',
    firstName: 'Nadia',
    lastName: 'Bensaid',
    gender: 'Female',
    age: 32,
    dateOfBirth: '1992-02-18',
    phone: '0555 62 81 04',
    email: 'nadia.bensaid@email.com',
    emergencyContact: 'Karim Bensaid • 0555 62 81 05',
    additionalInfo: 'No additional information',
    bloodType: 'O+ Positive',
    primaryPhysician: 'Dr. Alexander Thorne',
    registeredSince: 'Oct 2024',
    clinicalBaselines: {
      lastRecorded: 'Oct 28, 2024',
      knownAllergies: 'None recorded',
      chronicConditions: 'Under evaluation',
      restingBp: '122/80 mmHg',
      heartRate: '70 bpm',
      bmiMetric: '22.5 Normal'
    },
    recentVisits: [
      {
        id: 'V-2024-0050',
        dateTime: 'Oct 30, 2024 10:00 AM',
        physician: 'Dr. Alexander Thorne · Cardiology',
        reason: 'Follow-up consultation and blood pressure review',
        status: 'Scheduled',
        billing: 'Unpaid'
      }
    ]
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
    standardShifts: 'Monday through Friday · 08:30 AM — 04:30 PM EST',
    availability: {
      week: 'WEEK 44',
      days: [
        { key: 'MON', label: 'MON 28', date: '2024-10-28' },
        { key: 'TUE', label: 'TUE 29', date: '2024-10-29' },
        { key: 'WED', label: 'WED 30', date: '2024-10-30' },
        { key: 'THU', label: 'THU 31', date: '2024-10-31' },
        { key: 'FRI', label: 'FRI 01', date: '2024-11-01' }
      ],
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
    standardShifts: 'Monday through Friday · 09:00 AM — 05:00 PM EST',
    availability: {
      week: 'WEEK 44',
      days: [
        { key: 'MON', label: 'MON 28', date: '2024-10-28' },
        { key: 'TUE', label: 'TUE 29', date: '2024-10-29' },
        { key: 'WED', label: 'WED 30', date: '2024-10-30' },
        { key: 'THU', label: 'THU 31', date: '2024-10-31' },
        { key: 'FRI', label: 'FRI 01', date: '2024-11-01' }
      ],
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
    standardShifts: 'Tuesday through Saturday · 08:00 AM — 04:00 PM EST',
    availability: {
      week: 'WEEK 44',
      days: [
        { key: 'MON', label: 'MON 28', date: '2024-10-28' },
        { key: 'TUE', label: 'TUE 29', date: '2024-10-29' },
        { key: 'WED', label: 'WED 30', date: '2024-10-30' },
        { key: 'THU', label: 'THU 31', date: '2024-10-31' },
        { key: 'FRI', label: 'FRI 01', date: '2024-11-01' }
      ],
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
    standardShifts: 'Monday through Friday · 08:30 AM — 04:30 PM EST',
    availability: {
      week: 'WEEK 44',
      days: [
        { key: 'MON', label: 'MON 28', date: '2024-10-28' },
        { key: 'TUE', label: 'TUE 29', date: '2024-10-29' },
        { key: 'WED', label: 'WED 30', date: '2024-10-30' },
        { key: 'THU', label: 'THU 31', date: '2024-10-31' },
        { key: 'FRI', label: 'FRI 01', date: '2024-11-01' }
      ],
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

// Helper state storage with LocalStorage persistence
const PATIENTS_STORAGE_KEY = 'curapulse_patients';
const DOCTORS_STORAGE_KEY = 'curapulse_doctors';

// BACKEND API INTEGRATION: api.patients.getStoredPatients() -> GET /api/v1/patients
export function getStoredPatients() {
  const data = localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
  return INITIAL_PATIENTS;
}

// BACKEND API INTEGRATION: api.patients.saveStoredPatients() -> POST /api/v1/patients/batch
export function saveStoredPatients(patients) {
  localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
}

// BACKEND API INTEGRATION: api.patients.getById(id) -> GET /api/v1/patients/:id
export function getPatientById(id) {
  const patients = getStoredPatients();
  return patients.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
}

// BACKEND API INTEGRATION: api.patients.addPatient(data) -> POST /api/v1/patients
export function addPatient(patientData) {
  const patients = getStoredPatients();
  const nextNumber = patients.length + 100;
  const newId = patientData.id || `P-000${nextNumber}`;
  
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
    recentVisits: patientData.recentVisits || [],
    clinicalNotes: patientData.clinicalNotes || []
  };

  const updated = [newPatient, ...patients];
  saveStoredPatients(updated);
  return newPatient;
}

// BACKEND API INTEGRATION: api.patients.updatePatient(id, fields) -> PUT /api/v1/patients/:id
export function updatePatient(id, updatedFields) {
  const patients = getStoredPatients();
  const index = patients.findIndex(p => p.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  patients[index] = { ...patients[index], ...updatedFields };
  saveStoredPatients(patients);
  return patients[index];
}

// BACKEND API INTEGRATION: api.doctors.getStoredDoctors() -> GET /api/v1/doctors
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

// BACKEND API INTEGRATION: api.doctors.getDoctorById(id) -> GET /api/v1/doctors/:id
export function getDoctorById(id) {
  const doctors = getStoredDoctors();
  return doctors.find(d => d.id === id) || doctors[0];
}

// BACKEND API INTEGRATION: api.doctors.toggleDoctorSlot(id, day, time) -> PATCH /api/v1/doctors/:id/schedule/slot
export function toggleDoctorSlot(doctorId, dayKey, timeStr) {
  const doctors = getStoredDoctors();
  const doc = doctors.find(d => d.id === doctorId);
  if (!doc) return null;

  const timeSlot = doc.availability.timeSlots.find(ts => ts.time === timeStr);
  if (timeSlot && timeSlot.slots && timeSlot.slots[dayKey]) {
    timeSlot.slots[dayKey] = timeSlot.slots[dayKey] === 'Available' ? 'Booked' : 'Available';
    localStorage.setItem(DOCTORS_STORAGE_KEY, JSON.stringify(doctors));
  }
  return doc;
}
