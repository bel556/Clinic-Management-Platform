import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ReceptionLayout from '../layouts/ReceptionLayout'
import DoctorLayout from '../layouts/DoctorLayout'
import { useSession } from '../services/session'
import LoginPage from '../pages/LoginPage'
import PatientsPage from '../pages/reception/patients/PatientsPage'
import NewPatientPage from '../pages/reception/patients/NewPatientPage'
import PatientProfilePage from '../pages/reception/patients/PatientProfilePage'
import EditPatientPage from '../pages/reception/patients/EditPatientPage'
import VisitsPage from '../pages/reception/visits/VisitsPage'
import NewVisitPage from '../pages/reception/visits/NewVisitPage'
import VisitDetailPage from '../pages/reception/visits/VisitDetailPage'
import ModifyVisitPage from '../pages/reception/visits/ModifyVisitPage'
import CheckedInPage from '../pages/reception/visits/CheckedInPage'
import DoctorsPage from '../pages/reception/doctors/DoctorsPage'
import NotificationsPage from '../pages/reception/notifications/NotificationsPage'
import ReceptionProfilePage from '../pages/reception/profile/ReceptionProfilePage'
import DoctorQueuePage from '../pages/doctor/queue/DoctorQueuePage'
import DoctorPatientHistoryPage from '../pages/doctor/queue/DoctorPatientHistoryPage'
import DoctorVisitsPage from '../pages/doctor/visits/DoctorVisitsPage'
import VisitHistoryPage from '../pages/doctor/visits/VisitHistoryPage'
import AssignAppointmentPage from '../pages/doctor/visits/AssignAppointmentPage'
import RescheduleAppointmentPage from '../pages/doctor/visits/RescheduleAppointmentPage'
import AffectedAppointmentsPage from '../pages/doctor/visits/AffectedAppointmentsPage'
import RescheduleDayPage from '../pages/doctor/visits/RescheduleDayPage'
import DoctorProfilePage from '../pages/doctor/profile/DoctorProfilePage'
import DoctorAccountPage from '../pages/doctor/profile/DoctorAccountPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function RequireSession({ children }) {
  const { signedIn } = useSession()
  return signedIn ? children : <Navigate to="/login" replace />
}

function NotFound() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p className="u-muted" style={{ marginTop: 6 }}>
        The page you are looking for does not exist in this sprint build.
      </p>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/reception/patients" replace />} />

        <Route
          path="/reception"
          element={
            <RequireSession>
              <ReceptionLayout />
            </RequireSession>
          }
        >
          <Route index element={<Navigate to="/reception/patients" replace />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/new" element={<NewPatientPage />} />
          <Route path="patients/:patientId" element={<PatientProfilePage />} />
          <Route path="patients/:patientId/edit" element={<EditPatientPage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="visits/new" element={<NewVisitPage />} />
          <Route path="visits/:visitId" element={<VisitDetailPage />} />
          <Route path="visits/:visitId/edit" element={<ModifyVisitPage />} />
          <Route path="visits/:visitId/checked-in" element={<CheckedInPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ReceptionProfilePage />} />
        </Route>

        <Route
          path="/doctor"
          element={
            <RequireSession>
              <DoctorLayout />
            </RequireSession>
          }
        >
          <Route index element={<Navigate to="/doctor/queue" replace />} />
          <Route path="queue" element={<DoctorQueuePage />} />
          <Route path="queue/:visitId/history" element={<DoctorPatientHistoryPage />} />
          <Route path="visits" element={<DoctorVisitsPage />} />
          <Route path="visits/history" element={<VisitHistoryPage />} />
          <Route path="visits/new" element={<AssignAppointmentPage />} />
          <Route path="visits/day/affected" element={<AffectedAppointmentsPage />} />
          <Route path="visits/day/reschedule" element={<RescheduleDayPage />} />
          <Route path="visits/:visitId/reschedule" element={<RescheduleAppointmentPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
          <Route path="profile/account" element={<DoctorAccountPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
