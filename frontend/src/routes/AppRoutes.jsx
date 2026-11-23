
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
// import ReceptionLayout from '../layouts/ReceptionLayout';
import DoctorLayout from '../layouts/DoctorLayout';

// Receptionist Pages (temporarily disabled)
// import Patients from '../pages/receptionist/patients/Patients';
// import PatientDetailsPage from '../pages/receptionist/patients/PatientDetailsPage';
// import NewPatientPage from '../pages/receptionist/patients/NewPatientPage';
// import Doctors from '../pages/receptionist/doctors/Doctors';
// import DoctorAvailabilityPage from '../pages/receptionist/doctors/DoctorAvailabilityPage';

// Receptionist Teammate Modules (temporarily disabled)
// import Visits from '../pages/receptionist/visits/Visits';
// import Notifications from '../pages/receptionist/notifications/Notifications';
// import Profile from '../pages/receptionist/profile/Profile';

// Your Doctor Pages
import QueuePage from '../pages/doctor/queue/QueuePage';
import DoctorVisitsPage from '../pages/doctor/visits/DoctorVisitsPage';
import DoctorProfilePage from '../pages/doctor/profile/DoctorProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/doctor" replace />} />

      {/* Receptionist Portal (temporarily disabled)
      <Route path="/receptionist" element={<ReceptionLayout />}>
        <Route index element={<Navigate to="patients" replace />} />

        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<NewPatientPage />} />
        <Route path="patients/:id" element={<PatientDetailsPage />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id/availability" element={<DoctorAvailabilityPage />} />

        <Route path="visits" element={<Visits />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      */}

      {/* Doctor Portal */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="queue" replace />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="visits" element={<DoctorVisitsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/doctor" replace />} />
    </Routes>
  );
}
