/**
 * Clinic Management Platform - Frontend API Service
 * 
 * Provides unified fetch-based methods to interact with the FastAPI backend.
 * Base URL defaults to http://127.0.0.1:8000 (can be overridden via VITE_API_BASE_URL).
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Generic request wrapper using native fetch
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch {
      errorDetail = response.statusText;
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// ==========================================
// 1. PATIENT SERVICES
// ==========================================

export const patientService = {
  /**
   * Get all registered patients (directory view with pagination)
   * Endpoint: GET /patients?limit=50&offset=0
   * 
   * Expected Output:
   * [
   *   {
   *     patient_id: 30001,
   *     full_name: "Abderrahmen Belkheiri",
   *     birth_date: "2000-01-15",
   *     phone: "0555123456",
   *     gender: "male",
   *     email: "abderrahmen@example.com",
   *     additional_info: "Regular patient",
   *     emergency_contact: "0555987654"
   *   }
   * ]
   */
  getAllPatients(limit = 50, offset = 0) {
    return request(`/patients?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`);
  },

  /**
   * Search patients by name, phone, or ID (e.g. "P-1", "0555", "Abderrahmen")
   * Endpoint: GET /patients/search/{query}
   * 
   * Expected Output:
   * [
   *   {
   *     patient_id: 30001,
   *     full_name: "Abderrahmen Belkheiri",
   *     birth_date: "2000-01-15",
   *     phone: "0555123456",
   *     gender: "male",
   *     email: "abderrahmen@example.com",
   *     additional_info: "Regular patient",
   *     emergency_contact: "0555987654"
   *   }
   * ]
   */
  searchPatients(query) {
    return request(`/patients/search/${encodeURIComponent(query)}`);
  },

  /**
   * Get patient details by patient_id
   * Endpoint: GET /patients/{patient_id}
   * 
   * Expected Output:
   * {
   *   patient_id: 30001,
   *   full_name: "Abderrahmen Belkheiri",
   *   birth_date: "2000-01-15",
   *   phone: "0555123456",
   *   gender: "male",
   *   email: "abderrahmen@example.com",
   *   additional_info: "Regular patient",
   *   emergency_contact: "0555987654"
   * }
   */
  getPatientById(patientId) {
    return request(`/patients/${patientId}`);
  },

  /**
   * Get visits belonging to a patient, divided into upcoming and history
   * Endpoint: GET /patients/{patient_id}/visits
   * 
   * Expected Output:
   * {
   *   patient_id: 30001,
   *   upcoming: [
   *     {
   *       visit_id: 1,
   *       visit_date: "2026-11-26T10:00:00",
   *       financial_status: "unpaid",
   *       status: "scheduled",
   *       doctor_id: 1,
   *       doctor_name: "Dr. Sarah Jenkins",
   *       specialty: "Cardiology",
   *       position: null
   *     }
   *   ],
   *   history: [
   *     {
   *       visit_id: 3,
   *       visit_date: "2026-11-15T09:00:00",
   *       financial_status: "paid",
   *       status: "completed",
   *       doctor_id: 1,
   *       doctor_name: "Dr. Sarah Jenkins",
   *       specialty: "Cardiology",
   *       position: null
   *     }
   *   ]
   * }
   */
  getPatientVisits(patientId) {
    return request(`/patients/${patientId}/visits`);
  },

  /**
   * Create a new patient
   * Endpoint: POST /patients
   * 
   * @param {Object} patientData - { first_name, last_name, birth_date (YYYY-MM-DD), phone, gender ("male"|"female"), email, additional_info, emergency_contact }
   */
  createPatient(patientData) {
    return request('/patients', {
      method: 'POST',
      body: patientData,
    });
  },

  /**
   * Update existing patient information
   * Endpoint: PATCH /patients/{patient_id}
   */
  updatePatient(patientId, updateData) {
    return request(`/patients/${patientId}`, {
      method: 'PATCH',
      body: updateData,
    });
  },

  /**
   * Delete a patient (Note: patient must have no visits in backend)
   * Endpoint: DELETE /patients/{patient_id}
   */
  deletePatient(patientId) {
    return request(`/patients/${patientId}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// 2. DOCTOR SERVICES
// ==========================================

export const doctorService = {
  /**
   * Search doctors by name, specialty, or presence (or get all if no params)
   * Endpoint: GET /doctors/search?name=...&specialty=...&only_present=...
   */
  searchDoctors({ name, specialty, only_present = false } = {}) {
    const query = new URLSearchParams();
    if (name) query.append('name', name);
    if (specialty) query.append('specialty', specialty);
    if (only_present) query.append('only_present', 'true');

    const queryString = query.toString();
    return request(`/doctors/search${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Get doctor details by doctor_id
   * Endpoint: GET /doctors/{doctor_id}
   */
  getDoctorById(doctorId) {
    return request(`/doctors/${doctorId}`);
  },

  /**
   * Get real-time queue for a doctor
   * Endpoint: GET /doctors/{doctor_id}/queue
   */
  getDoctorQueue(doctorId) {
    return request(`/doctors/${doctorId}/queue`);
  },

  /**
   * Get visits for a specific doctor, optionally filtered by date (YYYY-MM-DD)
   * Endpoint: GET /doctors/{doctor_id}/visits?visit_day=...
   */
  getDoctorVisits(doctorId, visitDay = null) {
    const endpoint = visitDay
      ? `/doctors/${doctorId}/visits?visit_day=${encodeURIComponent(visitDay)}`
      : `/doctors/${doctorId}/visits`;
    return request(endpoint);
  },

  /**
   * Get availability status for a doctor
   * Endpoint: GET /doctors/{doctor_id}/availability
   * 
   * Expected Output:
   * {
   *   doctor_id: 1,
   *   full_name: "Dr. Sarah Jenkins",
   *   specialty: "Cardiology",
   *   start_day: "monday",
   *   end_day: "friday",
   *   availability_status: "present"
   * }
   */
  getDoctorAvailability(doctorId) {
    return request(`/doctors/${doctorId}/availability`);
  },

  /**
   * Update doctor presence/availability status
   * Endpoint: PATCH /doctors/{doctor_id}/availability
   * 
   * @param {number} doctorId
   * @param {"present" | "absent"} status
   * 
   * Expected Output:
   * {
   *   doctor_id: 1,
   *   full_name: "Dr. Sarah Jenkins",
   *   availability_status: "present"
   * }
   */
  updateDoctorAvailability(doctorId, status) {
    return request(`/doctors/${doctorId}/availability`, {
      method: 'PATCH',
      body: { status },
    });
  },
};

// ==========================================
// 3. VISIT SERVICES
// ==========================================

export const visitService = {
  /**
   * Get all visits for a patient with joined doctor & queue data
   * Endpoint: GET /visits/by-patient/{patient_id}
   */
  getVisitsByPatient(patientId) {
    return request(`/visits/by-patient/${patientId}`);
  },

  /**
   * Get visits filtered by status ('scheduled', 'checked_in', 'completed', 'missed', 'cancelled')
   * Endpoint: GET /visits/by-status/{visit_status}?visit_day=...
   */
  getVisitsByStatus(status, visitDay = null) {
    const query = visitDay ? `?visit_day=${encodeURIComponent(visitDay)}` : '';
    return request(`/visits/by-status/${encodeURIComponent(status)}${query}`);
  },

  /**
   * Get all visits on a specific date (YYYY-MM-DD)
   * Endpoint: GET /visits/by-date/{visit_day}
   */
  getVisitsByDate(visitDay) {
    return request(`/visits/by-date/${encodeURIComponent(visitDay)}`);
  },

  /**
   * Get visits by type (e.g., 'Check-up', 'Consultation', 'Follow-up')
   * Endpoint: GET /visits/by-type/{visit_type}
   */
  getVisitsByType(visitType) {
    return request(`/visits/by-type/${encodeURIComponent(visitType)}`);
  },

  /**
   * Get current queue position for a visit
   * Endpoint: GET /visits/{visit_id}/queue
   */
  getVisitQueueNumber(visitId) {
    return request(`/visits/${visitId}/queue`);
  },

  /**
   * Get full visit details including medical notes for the attending doctor
   * Endpoint: GET /visits/{visit_id}/details?doctor_id=...
   */
  getVisitDetails(visitId, doctorId) {
    return request(`/visits/${visitId}/details?doctor_id=${encodeURIComponent(doctorId)}`);
  },

  /**
   * Schedule a new visit
   * Endpoint: POST /visits
   */
  createVisit(visitData) {
    return request('/visits', {
      method: 'POST',
      body: visitData,
    });
  },

  /**
   * Modify visit information (reschedule date, change doctor, change status or type)
   * Endpoint: PATCH /visits/{visit_id}
   */
  modifyVisit(visitId, modifyData) {
    return request(`/visits/${visitId}`, {
      method: 'PATCH',
      body: modifyData,
    });
  },

  /**
   * Cancel a scheduled visit
   * Endpoint: PATCH /visits/{visit_id}/cancel
   */
  cancelVisit(visitId) {
    return request(`/visits/${visitId}/cancel`, {
      method: 'PATCH',
    });
  },
};

// ==========================================
// 4. CONSULTATION & MEDICAL NOTES SERVICES
// ==========================================

export const consultationService = {
  /**
   * Get all clinical notes for a specific visit
   * Endpoint: GET /visits/{visit_id}/notes
   * 
   * Expected Output:
   * [
   *   {
   *     note_id: 1,
   *     visit_id: 2,
   *     content: "Patient reports mild chest discomfort after exercise."
   *   }
   * ]
   */
  getVisitNotes(visitId) {
    return request(`/visits/${visitId}/notes`);
  },

  /**
   * Add a new medical note to a visit
   * Endpoint: POST /visits/{visit_id}/notes
   * 
   * @param {number} visitId
   * @param {string} content
   * 
   * Expected Output:
   * {
   *   note_id: 2,
   *   visit_id: 2,
   *   content: "Prescribed 10mg Lisinopril once daily."
   * }
   */
  createMedicalNote(visitId, content) {
    return request(`/visits/${visitId}/notes`, {
      method: 'POST',
      body: { content },
    });
  },

  /**
   * Update an existing medical note
   * Endpoint: PATCH /medical-notes/{note_id}
   * 
   * @param {number} noteId
   * @param {string} content
   * 
   * Expected Output:
   * {
   *   note_id: 2,
   *   visit_id: 2,
   *   content: "Updated dosage: 20mg Lisinopril once daily."
   * }
   */
  updateMedicalNote(noteId, content) {
    return request(`/medical-notes/${noteId}`, {
      method: 'PATCH',
      body: { content },
    });
  },
};

// ==========================================
// 5. NOTIFICATION SERVICES
// ==========================================

export const notificationService = {
  /**
   * Get notifications (all or unread only)
   * Endpoint: GET /notifications?unread_only=false
   * 
   * Expected Output:
   * [
   *   {
   *     notification_id: 1,
   *     visit_id: 2,
   *     message: "Doctor changed visit 2 date to 2026-11-28.",
   *     is_read: 0,
   *     patient_name: "Abderrahmen Belkheiri",
   *     doctor_name: "Dr. Sarah Jenkins"
   *   }
   * ]
   */
  getNotifications(unreadOnly = false) {
    return request(`/notifications?unread_only=${encodeURIComponent(unreadOnly)}`);
  },

  /**
   * Create a new alert notification
   * Endpoint: POST /notifications
   */
  createNotification(visitId, message) {
    return request('/notifications', {
      method: 'POST',
      body: { visit_id: visitId, message },
    });
  },

  /**
   * Mark a single notification as read
   * Endpoint: PATCH /notifications/{notification_id}/read
   */
  markNotificationRead(notificationId) {
    return request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Mark all unread notifications as read
   * Endpoint: PATCH /notifications/read-all
   */
  markAllNotificationsRead() {
    return request('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  /**
   * Delete / dismiss a notification
   * Endpoint: DELETE /notifications/{notification_id}
   */
  deleteNotification(notificationId) {
    return request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};

// Default export combining all service modules
export default {
  patient: patientService,
  doctor: doctorService,
  visit: visitService,
  consultation: consultationService,
  notification: notificationService,
};
