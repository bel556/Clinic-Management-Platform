import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import ReceptionLayout from '../layouts/ReceptionLayout';
import DoctorLayout from '../layouts/DoctorLayout';

// Receptionist Pages (Person 1)
import Patients from '../pages/receptionist/patients/Patients';
import PatientDetailsPage from '../pages/receptionist/patients/PatientDetailsPage';
import NewPatientPage from '../pages/receptionist/patients/NewPatientPage';
import Doctors from '../pages/receptionist/doctors/Doctors';
import DoctorAvailabilityPage from '../pages/receptionist/doctors/DoctorAvailabilityPage';

// Placeholder Pages (Teammates)
import Visits from '../pages/receptionist/visits/Visits';
import Notifications from '../pages/receptionist/notifications/Notifications';
import Profile from '../pages/receptionist/profile/Profile';

import DoctorQueue from '../pages/doctor/queue/DoctorQueue';
import DoctorVisits from '../pages/doctor/visits/DoctorVisits';
import DoctorProfile from '../pages/doctor/profile/DoctorProfile';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/receptionist/patients" replace />} />

      {/* Receptionist Portal */}
      <Route path="/receptionist" element={<ReceptionLayout />}>
        <Route index element={<Navigate to="patients" replace />} />
        
        {/* Person 1 Routes */}
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<NewPatientPage />} />
        <Route path="patients/:id" element={<PatientDetailsPage />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/:id/availability" element={<DoctorAvailabilityPage />} />

        {/* Teammate modules */}
        <Route path="visits" element={<Visits />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Doctor Portal */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route index element={<Navigate to="queue" replace />} />
        <Route path="queue" element={<DoctorQueue />} />
        <Route path="visits" element={<DoctorVisits />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/receptionist/patients" replace />} />
    </Routes>
  );
}
