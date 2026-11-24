/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STAFF } from './mockDb'
import { DEMO_MODE } from './config'
import { listDoctors } from './doctors'
import { listEmployees, updateEmployeeAvailability } from './employees'
import { refreshNotifications } from './notifications'

const SessionContext = createContext(null)

/**
 * Session bootstrap.
 *
 * Authentication is not part of the API yet, so the app starts signed in and
 * loads the staff directory to build the two workspace identities. Presence is
 * persisted through EMPLOYEEAVAILABILITY (receptionist) and
 * /doctors/{id}/availability (doctor).
 */
export function SessionProvider({ children }) {
  const [signedIn, setSignedIn] = useState(true)
  const [presence, setPresenceState] = useState('Present')
  const [availability, setAvailability] = useState(true)
  const [receptionistProfile, setReceptionistProfile] = useState(null)
  const [doctorId, setDoctorId] = useState(DEMO_MODE ? 'D-01' : null)
  const [doctorProfile, setDoctorProfile] = useState(null)

  useEffect(() => {
    if (!DEMO_MODE) refreshNotifications()
  }, [])

  useEffect(() => {
    let cancelled = false
    listEmployees()
      .then((employees) => {
        if (cancelled) return
        const receptionist = employees.find((employee) =>
          employee.role === 'receptionist' || employee.role === 'employee',
        )
        if (receptionist) {
          setReceptionistProfile(receptionist)
          setPresenceState(receptionist.availability ?? 'Absent')
        }
      })
      .catch(() => {
        /* backend unreachable — keep placeholder identity */
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    listDoctors()
      .then((doctors) => {
        if (cancelled || !doctors?.length) return
        const doctor =
          doctors.find((item) => (item.queueCount ?? 0) > 0) ?? doctors[0]
        setDoctorId(doctor.id)
        setDoctorProfile(doctor)
        setAvailability(Boolean(doctor.present))
      })
      .catch(() => {
        /* backend unreachable — keep the placeholder identity */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const logIn = useCallback(() => setSignedIn(true), [])
  const logOut = useCallback(() => setSignedIn(false), [])

  const setPresence = useCallback(
    async (next) => {
      setPresenceState(next)
      const employeeId = receptionistProfile?.id
      if (employeeId === null || employeeId === undefined) return
      try {
        const updated = await updateEmployeeAvailability(employeeId, next)
        setReceptionistProfile((current) => (current ? { ...current, ...updated } : updated))
      } catch {
        /* failure is surfaced by the global error toast */
      }
    },
    [receptionistProfile?.id],
  )

  const value = useMemo(() => {
    const doctorUser = doctorProfile
      ? {
          ...STAFF.doctor,
          id: doctorProfile.id,
          name: doctorProfile.name,
          role: `Doctor · ${doctorProfile.specialty}`,
          department: doctorProfile.specialty,
          specialty: doctorProfile.specialty,
          email: doctorProfile.email,
          phone: doctorProfile.phone,
          examRoom: doctorProfile.room,
          assignedClinic: doctorProfile.room,
          room: doctorProfile.room,
          npi: doctorProfile.npi,
          license: doctorProfile.license,
          slotLength: doctorProfile.slot,
          startDay: doctorProfile.startDay,
          endDay: doctorProfile.endDay,
          present: doctorProfile.present,
        }
      : STAFF.doctor

    const receptionistUser = {
      ...STAFF.receptionist,
      id: receptionistProfile?.id ?? STAFF.receptionist.id,
      ref: receptionistProfile?.ref ?? null,
      name: receptionistProfile?.name ?? STAFF.receptionist.name,
      email: receptionistProfile?.email ?? STAFF.receptionist.email,
      phone: receptionistProfile?.phone ?? STAFF.receptionist.phone,
      role: 'Receptionist',
      department: 'Reception',
      workLocation: receptionistProfile?.room || 'Front desk',
      room: receptionistProfile?.room || '',
      startDay: receptionistProfile?.startDay ?? null,
      endDay: receptionistProfile?.endDay ?? null,
      presence,
    }

    return {
      users: { receptionist: receptionistUser, doctor: doctorUser },
      doctorId,
      signedIn,
      presence,
      availability,
      setPresence,
      setAvailability,
      logIn,
      logOut,
    }
  }, [doctorId, doctorProfile, receptionistProfile, presence, signedIn, availability, setPresence, logIn, logOut])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession must be used inside <SessionProvider>')
  return context
}
