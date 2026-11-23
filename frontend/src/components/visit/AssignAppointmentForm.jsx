import { useState } from "react";
import { useClinic, assignAppointment, getAvailableSlots, getDoctor, TODAY } from "../../services/clinicStore";
import { fmtTime, fullName } from "../../utils/format";

export default function AssignAppointmentForm({ initialPatientId = "", onCancel, onDone }) {
  const s = useClinic();
  const doctor = getDoctor(s);
  const [form, setForm] = useState({ patientId: initialPatientId, date: "", time: "", reason: "" });
  const [errors, setErrors] = useState({});
  const slots = form.date ? getAvailableSlots(s, form.date) : [];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "date" ? { time: "" } : {}) }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.patientId) err.patientId = "Choose a patient.";
    if (!form.date) err.date = "Choose a date."; else if (form.date < TODAY) err.date = "Date cannot be in the past.";
    if (!form.time) err.time = "Choose an available time.";
    if (!form.reason.trim()) err.reason = "Enter the reason for the visit.";
    setErrors(err);
    if (Object.keys(err).length) return;
    assignAppointment({ ...form, reason: form.reason.trim() });
    onDone();
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>Assign new appointment</h2>
      <label className="field"><span>Patient *</span>
        <select value={form.patientId} onChange={set("patientId")}>
          <option value="">Select an existing patient…</option>
          {s.patients.map((p) => <option key={p.patientId} value={p.patientId}>{fullName(p)} · {p.patientId}</option>)}
        </select>
        {errors.patientId && <em className="error">{errors.patientId}</em>}</label>
      <div className="two-col">
        <label className="field"><span>Date *</span>
          <input type="date" min={TODAY} value={form.date} onChange={set("date")} />
          {errors.date && <em className="error">{errors.date}</em>}</label>
        <label className="field"><span>Available slot *</span>
          <select value={form.time} onChange={set("time")} disabled={!form.date}>
            <option value="">{form.date ? (slots.length ? "Select a time…" : "No available times") : "Pick a date first"}</option>
            {slots.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
          </select>
          {errors.time && <em className="error">{errors.time}</em>}</label>
      </div>
      <label className="field"><span>Doctor</span><input value={`${doctor.name} · ${doctor.specialty} (read-only)`} readOnly /></label>
      <label className="field"><span>Reason for visit *</span>
        <input value={form.reason} onChange={set("reason")} placeholder="Follow-up consultation" />
        {errors.reason && <em className="error">{errors.reason}</em>}</label>
      <p className="hint">This appointment is assigned to you. It appears in reception's Visits screen and in the patient's history. Payment defaults to Unpaid. The queue number is assigned at check-in.</p>
      <div className="row-between">
        <button type="button" className="btn btn-soft" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn">Create appointment</button>
      </div>
    </form>
  );
}
