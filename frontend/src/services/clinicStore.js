// SHARED DATA LAYER (mock). Agree with Person 1 / Person 3 where the real one lives,
// then keep the function names below (or adapt the imports in the Doctor files).
import { useSyncExternalStore } from "react";

export const TODAY = "2024-10-28";
export const CURRENT_DOCTOR_ID = "D-001";
export const SLOTS = ["08:30","09:00","09:30","10:00","10:30","11:00","11:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30"];

const patient = (patientId, firstName, lastName, phone, dob) => ({ patientId, firstName, lastName, phone, dob });
const visit = (visitId, patientId, type, date, time, status, paymentStatus, queueNumber, reason = "") =>
  ({ visitId, patientId, doctorId: "D-001", type, date, time, status, paymentStatus, queueNumber, reason });

let state = {
  doctors: [
    { doctorId: "D-001", name: "Dr. Alexander Thorne", email: "a.thorne@curapulse.health", specialty: "Cardiology", location: "Downtown Medical Center · Room 204", presence: "present" },
    { doctorId: "D-002", name: "Dr. Elena Vance", specialty: "Neurology" },
    { doctorId: "D-003", name: "Dr. Robert Chen", specialty: "Pediatrics" },
    { doctorId: "D-004", name: "Dr. Maya Lin", specialty: "General Practice" },
  ],
  patients: [
    patient("P-000108", "Marcus", "Vance", "+1 (555) 438-9920", "1980-03-18"),
    patient("P-000142", "Elena", "Rostova", "+1 (555) 234-8901", "1988-05-14"),
    patient("P-000155", "David", "Kim", "+1 (555) 309-8812"),
    patient("P-000154", "Amina", "Lin", "+1 (555) 712-4091"),
    patient("P-000160", "Carlos", "Mendez", "+1 (555) 610-2200"),
    patient("P-000152", "Sofia", "Reyes", "+1 (555) 911-3049"),
    patient("P-000153", "David", "Hayes", "+1 (555) 309-8813"),
    patient("P-000168", "Lucas", "Walker", "+1 (555) 700-1168"),
  ],
  visits: [
    visit("V-2024-0046", "P-000108", "consultation", TODAY, "09:00", "present", "paid", "Q-01", "Blood pressure review"),
    visit("V-2024-0047", "P-000142", "appointment", TODAY, "09:30", "present", "unpaid", "Q-02", "Follow-up consultation"),
    visit("V-2024-0048", "P-000155", "regular", TODAY, "10:00", "present", "unpaid", "Q-03"),
    visit("V-2024-0049", "P-000154", "consultation", TODAY, "10:30", "present", "paid", "Q-04"),
    visit("V-2024-0050", "P-000152", "consultation", "2024-10-29", "09:00", "upcoming", "unpaid", null, "Consultation"),
    visit("V-2024-0051", "P-000160", "appointment", "2024-10-29", "09:30", "upcoming", "unpaid", null, "Appointment"),
    visit("V-2024-0052", "P-000154", "appointment", "2024-10-29", "10:00", "upcoming", "paid", null, "Follow-up"),
    visit("V-2024-0053", "P-000168", "consultation", "2024-10-29", "11:00", "upcoming", "paid", null, "Consultation"),
    visit("V-2024-0054", "P-000153", "appointment", "2024-10-29", "13:30", "upcoming", "paid", null, "Appointment"),
    visit("V-2024-0055", "P-000142", "appointment", "2024-10-29", "14:30", "upcoming", "unpaid", null, "Follow-up"),
    visit("V-2024-0039", "P-000108", "consultation", "2024-10-24", "09:00", "done", "paid", "Q-01"),
    visit("V-2024-0038", "P-000142", "appointment", "2024-10-23", "09:30", "done", "unpaid", "Q-02"),
    visit("V-2024-0035", "P-000153", "appointment", "2024-10-22", "10:00", "missed", "unpaid", "Q-03"),
  ],
  notes: [
    { noteId: "N-0001", patientId: "P-000108", doctorId: "D-001", visitId: "V-2024-0039", createdAt: "2024-10-24T10:00", content: "Follow-up blood pressure review. Patient reports reduced chest tightness after exertion. Continue the prescribed plan and review in 3 months." },
    { noteId: "N-0002", patientId: "P-000108", doctorId: "D-002", visitId: "V-2024-0031", createdAt: "2024-10-12T09:00", content: "Annual assessment completed. Mild hypertension documented. Advised sodium reduction, regular cardiovascular activity and monitoring at home." },
    { noteId: "N-0003", patientId: "P-000108", doctorId: "D-004", visitId: "V-2024-0018", createdAt: "2024-08-14T14:15", content: "Routine review. Medication history checked and recorded. Patient advised to bring previous laboratory results to the next consultation." },
  ],
  notifications: [],
};

const listeners = new Set();
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const update = (fn) => { state = fn(state); listeners.forEach((l) => l()); };
export const useClinic = () => useSyncExternalStore(subscribe, () => state);

const nextId = (list, key, prefix, width = 4) =>
  prefix + String(Math.max(0, ...list.map((i) => parseInt(i[key].split("-").pop(), 10))) + 1).padStart(width, "0");

// ---------- selectors ----------
const mine = (s) => s.visits.filter((v) => v.doctorId === CURRENT_DOCTOR_ID);
const byWhen = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
export const getDoctor = (s, id = CURRENT_DOCTOR_ID) => s.doctors.find((d) => d.doctorId === id);
export const getDoctorName = (s, id) => getDoctor(s, id)?.name ?? "Unknown doctor";
export const getPatient = (s, id) => s.patients.find((p) => p.patientId === id);
export const getQueue = (s) => mine(s).filter((v) => v.date === TODAY && v.status === "present").sort((a, b) => a.queueNumber.localeCompare(b.queueNumber));
export const getTodayVisits = (s) => mine(s).filter((v) => v.date === TODAY && v.status !== "cancelled");
export const getUpcoming = (s) => mine(s).filter((v) => v.status === "upcoming").sort(byWhen);
export const getHistory = (s) => mine(s).filter((v) => ["done", "missed", "cancelled"].includes(v.status)).sort((a, b) => byWhen(b, a));
export const getPatientNotes = (s, patientId) => s.notes.filter((n) => n.patientId === patientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
export const getPatientVisits = (s, patientId) => s.visits.filter((v) => v.patientId === patientId).sort((a, b) => byWhen(b, a));
export const getAvailableSlots = (s, date, excludeVisitId) => {
  const taken = mine(s).filter((v) => v.date === date && ["upcoming", "present"].includes(v.status) && v.visitId !== excludeVisitId).map((v) => v.time);
  return SLOTS.filter((t) => !taken.includes(t));
};
export const getDayVisits = (s, date) => mine(s).filter((v) => v.date === date && v.status === "upcoming").sort(byWhen);

// ---------- actions (Done/Missed touch `status` ONLY, never paymentStatus) ----------
export const setVisitStatus = (visitId, status) =>
  update((s) => ({ ...s, visits: s.visits.map((v) => (v.visitId === visitId ? { ...v, status } : v)) }));

export const addNote = ({ patientId, visitId, content }) =>
  update((s) => ({ ...s, notes: [...s.notes, { noteId: nextId(s.notes, "noteId", "N-"), patientId, doctorId: CURRENT_DOCTOR_ID, visitId, content, createdAt: `${TODAY}T${new Date().toTimeString().slice(0, 5)}` }] }));

export const assignAppointment = ({ patientId, date, time, reason }) =>
  update((s) => ({ ...s, visits: [...s.visits, { visitId: nextId(s.visits, "visitId", "V-2024-"), patientId, doctorId: CURRENT_DOCTOR_ID, type: "appointment", date, time, status: "upcoming", paymentStatus: "unpaid", queueNumber: null, reason }] }));

// Minimum agreed notification: { notificationId, visitId, type, status }. Extra fields help reception.
const withNotifications = (s, entries) => {
  let list = s.notifications;
  entries.forEach((e) => { list = [...list, { notificationId: nextId(list, "notificationId", "N-"), status: "unread", createdAt: TODAY, ...e }]; });
  return list;
};

export const rescheduleVisit = (visitId, { date, time, reason }) =>
  update((s) => {
    const old = s.visits.find((v) => v.visitId === visitId);
    return { ...s,
      visits: s.visits.map((v) => (v.visitId === visitId ? { ...v, date, time } : v)),
      notifications: withNotifications(s, [{ visitId, type: "rescheduled", reason, oldDate: old.date, oldTime: old.time, newDate: date, newTime: time }]) };
  });

export const cancelVisit = (visitId, reason) =>
  update((s) => ({ ...s,
    visits: s.visits.map((v) => (v.visitId === visitId ? { ...v, status: "cancelled" } : v)),
    notifications: withNotifications(s, [{ visitId, type: "cancelled", reason }]) }));

// Bulk actions only touch this doctor's *upcoming* visits on that exact date.
export const cancelDay = (date, reason) =>
  update((s) => {
    const ids = getDayVisits(s, date).map((v) => v.visitId);
    return { ...s,
      visits: s.visits.map((v) => (ids.includes(v.visitId) ? { ...v, status: "cancelled" } : v)),
      notifications: withNotifications(s, ids.map((visitId) => ({ visitId, type: "cancelled", reason }))) };
  });

export const rescheduleDay = (fromDate, toDate, reason) =>
  update((s) => {
    const affected = getDayVisits(s, fromDate);
    const ids = affected.map((v) => v.visitId);
    return { ...s,
      visits: s.visits.map((v) => (ids.includes(v.visitId) ? { ...v, date: toDate } : v)),
      notifications: withNotifications(s, affected.map((v) => ({ visitId: v.visitId, type: "rescheduled", reason, oldDate: fromDate, oldTime: v.time, newDate: toDate, newTime: v.time }))) };
  });

export const setPresence = (presence) =>
  update((s) => ({ ...s, doctors: s.doctors.map((d) => (d.doctorId === CURRENT_DOCTOR_ID ? { ...d, presence } : d)) }));
