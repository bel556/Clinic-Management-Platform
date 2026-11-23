import { useState } from "react";
import { useClinic, rescheduleVisit, getAvailableSlots, getPatient, getDoctor, TODAY } from "../../services/clinicStore";
import { fmtDate, fmtTime, fullName } from "../../utils/format";

export default function RescheduleForm({ visit, onCancel, onDone }) {
  const s = useClinic();
  const [form, setForm] = useState({ date: visit.date, time: "", reason: "" });
  const [errors, setErrors] = useState({});
  const slots = getAvailableSlots(s, form.date, visit.visitId);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value, ...(k === "date" ? { time: "" } : {}) }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.date || form.date < TODAY) err.date = "Choose today or a future date.";
    if (!form.time) err.time = "Choose an available time.";
    if (!form.reason.trim()) err.reason = "A reason is required.";
    setErrors(err);
    if (Object.keys(err).length) return;
    rescheduleVisit(visit.visitId, { ...form, reason: form.reason.trim() });
    onDone();
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>Reschedule appointment</h2>
      <div className="summary">{fullName(getPatient(s, visit.patientId))} · {visit.patientId} · {visit.visitId}<br />Current slot: {fmtDate(visit.date)} · {fmtTime(visit.time)}</div>
      <div className="two-col">
        <label className="field"><span>New date *</span><input type="date" min={TODAY} value={form.date} onChange={set("date")} />{errors.date && <em className="error">{errors.date}</em>}</label>
        <label className="field"><span>Available slot *</span>
          <select value={form.time} onChange={set("time")}>
            <option value="">{slots.length ? "Select a time…" : "No available times"}</option>
            {slots.map((t) => <option key={t} value={t}>{fmtTime(t)}</option>)}
          </select>{errors.time && <em className="error">{errors.time}</em>}</label>
      </div>
      <label className="field"><span>Doctor</span><input value={`${getDoctor(s).name} · ${getDoctor(s).specialty} (read-only)`} readOnly /></label>
      <label className="field"><span>Reason *</span><input value={form.reason} onChange={set("reason")} />{errors.reason && <em className="error">{errors.reason}</em>}</label>
      <p className="hint">The appointment stays Upcoming. Reception is notified with the old and new time and will inform the patient.</p>
      <div className="row-between">
        <button type="button" className="btn btn-soft" onClick={onCancel}>Keep current time</button>
        <button type="submit" className="btn">Confirm reschedule</button>
      </div>
    </form>
  );
}
