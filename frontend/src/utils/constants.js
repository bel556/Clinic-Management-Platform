/** Demo clock: the sprint-1 mockups are all captured on Tue 29 Oct 2024, 09:42. */
export const DEMO_NOW = new Date('2024-10-29T09:42:00')
export const TODAY = '2024-10-29'
export const TOMORROW = '2024-10-30'

export const CLINIC = {
  name: 'Downtown Medical Center',
  suite: 'Suite 400',
  address: 'Downtown Center · Suite 400',
  phone: 'Tel. (555) 010-2834',
}

export const ROLES = {
  receptionist: 'receptionist',
  doctor: 'doctor',
}

export const VISIT_STATUS = {
  Upcoming: {
    label: 'Upcoming',
    tone: 'blue',
    description: 'Scheduled but not checked in',
  },
  Present: {
    label: 'Present',
    tone: 'green',
    description: 'Checked in and waiting',
  },
  Missed: {
    label: 'Missed',
    tone: 'red',
    description: 'Did not attend the allocated slot',
  },
  Done: {
    label: 'Done',
    tone: 'slate',
    description: 'Consultation completed',
  },
  Cancelled: {
    label: 'Cancelled',
    tone: 'slate',
    description: 'Cancelled by the doctor or reception',
  },
}

export const VISIT_STATUS_LIST = ['Upcoming', 'Present', 'Missed', 'Done']

export const BILLING = ['Unpaid', 'Paid']

export const VISIT_TYPES = ['Regular', 'Appointment', 'Consultation']

export const SPECIALTIES = [
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'General Practice',
  'Orthopedics',
  'Internal Medicine',
  'Dermatology',
  'Radiology',
]

export const TIME_SLOTS = [
  '08:30 AM – 09:00 AM',
  '09:00 AM – 09:30 AM',
  '09:30 AM – 10:00 AM',
  '10:00 AM – 10:30 AM',
  '10:30 AM – 11:00 AM',
  '11:00 AM – 11:30 AM',
  '11:30 AM – 12:00 PM',
  '12:00 PM – 12:30 PM',
  '01:30 PM – 02:00 PM',
  '02:00 PM – 02:30 PM',
  '02:30 PM – 03:00 PM',
  '03:00 PM – 03:30 PM',
  '03:30 PM – 04:00 PM',
  '04:00 PM – 04:30 PM',
]

export const RECEPTION_NAV = [
  { to: '/reception/patients', label: 'Patients', icon: 'users' },
  { to: '/reception/visits', label: 'Visits', icon: 'calendar' },
  { to: '/reception/doctors', label: 'Doctors', icon: 'stethoscope' },
  {
    to: '/reception/notifications',
    label: 'Notifications',
    icon: 'bell',
    badge: 'unread',
  },
  { to: '/reception/profile', label: 'Profile', icon: 'user' },
]

export const DOCTOR_NAV = [
  { to: '/doctor/queue', label: 'Queue', icon: 'listOrdered' },
  { to: '/doctor/visits', label: 'Visits', icon: 'calendar' },
  { to: '/doctor/profile', label: 'Profile', icon: 'user' },
]

export const NOTIFICATION_KINDS = {
  action: { label: 'Action required', tone: 'teal' },
  high: { label: 'High priority · Action required', tone: 'red' },
  roster: { label: 'Roster event', tone: 'slate' },
  handled: { label: 'Handled', tone: 'green' },
}
