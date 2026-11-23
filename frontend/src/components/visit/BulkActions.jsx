import { useState } from "react";
import { useClinic, getUpcoming, getDayVisits, getAvailableSlots, getPatient, getDoctor, cancelDay, rescheduleDay, TODAY } from "../../services/clinicStore";
import { fmtDate, fmtTime, fullName } from "../../utils/format";
import Modal from "../common/Modal";
import DoctorVisitTable from "./DoctorVisitTable";

// Two screens, as in the design:
//  "review"     -> Affected appointments (list + Reschedule / Cancel entire day)
//  "reschedule" -> Reschedule entire day (form, then the original/new slot table, then buttons)
export default function BulkActions({ onBack }) {
  const s = useClinic();
  const doctor = getDoctor(s);
  const dates = [...new Set(getUpcoming(s).map((v) => v.date))];
  const [date, setDate] = useState(dates[0] ?? "");
  const [mode, setMode] = useState("review");
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const affected = date ? getDayVisits(s, date) : [];
  const appointments = affected.filter((v) => v.type === "appointment").length;
  const consultations = affected.filter((v) => v.type === "consultation").length;
  const free = newDate ? getAvailableSlots(s, newDate) : [];
  const conflicts = newDate ? affected.filter((v) => !free.includes(v.time)) : [];

  const doCancel = () => {
    if (!reason.trim()) { setError("A reason is required."); return; }
    cancelDay(date, reason.trim()); setConfirmCancel(false); onBack();
  };
  const doReschedule = (e) => {
    e.preventDefault();
    if (!newDate || newDate < TODAY || newDate === date) { setError("Choose a different, future date."); return; }
    if (!reason.trim()) { setError("A reason is required."); return; }
    if (conflicts.length) { setError("Some times are already booked on that date."); return; }
    rescheduleDay(date, newDate, reason.trim()); onBack();
  };

  if (mode === "reschedule") {
    return (
      <form className="card" onSubmit={doReschedule} noValidate>
        <h2>Reschedule entire day</h2>
        <div className="summary">{doctor.name} · {fmtDate(date)}<br />{affected.length} visits will move together. Each patient keeps their current time.</div>
        <div className="two-col">
          <label className="field"><span>Original date</span><input value={fmtDate(date)} readOnly /></label>
          <label className="field"><span>New date *</span>
            <input type="date" min={TODAY} value={newDate} onChange={(e) => { setNewDate(e.target.value); setError(""); }} /></label>
        </div>
        <label className="field"><span>Reason *</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Change in clinic schedule" /></label>
        {newDate && (
          <p className={conflicts.length ? "error" : "hint"}>
            {conflicts.length
              ? `${conflicts.length} original time(s) are already booked on ${fmtDate(newDate)}.`
              : `Availability checked · All ${affected.length} original times are available on ${fmtDate(newDate)}. No overlapping bookings.`}
          </p>
        )}
        {error && <p className="error">{error}</p>}
        <div className="scroll-x">
          <table className="table">
            <thead><tr><th>Patient</th><th>Original slot</th><th>New slot</th></tr></thead>
            <tbody>
              {affected.map((v) => (
                <tr key={v.visitId}>
                  <td><strong>{fullName(getPatient(s, v.patientId))}</strong><br /><small className="muted">{v.patientId}</small></td>
                  <td>{fmtDate(v.date)} · {fmtTime(v.time)}</td>
                  <td>{newDate ? `${fmtDate(newDate)} · ${fmtTime(v.time)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">Reception will receive the affected visit list and new times. Queue numbers will be assigned when patients check in on the new date.</p>
        <div className="row-between">
          <button type="button" className="btn btn-soft" onClick={() => { setMode("review"); setError(""); }}>Keep original schedule</button>
          <button type="submit" className="btn">Reschedule all {affected.length} visits</button>
        </div>
      </form>
    );
  }

  return (
    <section className="card">
      <h2>Affected appointments</h2>
      {dates.length === 0 ? <p className="empty">No upcoming visits to change.</p> : (
        <>
          <label className="field"><span>Day to change *</span>
            <select value={date} onChange={(e) => setDate(e.target.value)}>
              {dates.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
            </select></label>
          <p className="hint">{affected.length} upcoming visits for {doctor.name} · {appointments} appointments and {consultations} consultations. Only this doctor's visits on the selected day are affected.</p>
          <h3>Review all {affected.length} patients</h3>
          <DoctorVisitTable visits={affected} canAct={false} />
          <p className="hint">{affected.length} of {affected.length} visits shown · No visits have been changed yet.</p>
        </>
      )}
      <div className="row-between">
        <button className="btn btn-soft" onClick={onBack}>Back to visits</button>
        <span>
          <button className="btn" disabled={!affected.length} onClick={() => { setMode("reschedule"); setReason(""); setNewDate(""); setError(""); }}>Reschedule entire day</button>{" "}
          <button className="btn btn-danger" disabled={!affected.length} onClick={() => { setConfirmCancel(true); setReason(""); setError(""); }}>Cancel entire day</button>
        </span>
      </div>
      <p className="hint">Reception is notified after you confirm a change. Payment statuses remain unchanged.</p>

      <Modal open={confirmCancel} danger eyebrow="Day-wide change" title={`Cancel all ${affected.length} appointments?`}
        actions={<><button className="btn btn-soft" onClick={() => setConfirmCancel(false)}>Keep schedule</button><button className="btn btn-danger" onClick={doCancel}>Cancel all {affected.length} visits</button></>}>
        <p>All appointments and consultations on {date && fmtDate(date)} will be cancelled for {doctor.name}.</p>
        <div className="summary">{date && fmtDate(date)}<br />{affected.length} patients · {appointments} appointments · {consultations} consultations</div>
        <label className="field"><span>Reason *</span><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Emergency medical leave" /></label>
        {error && <p className="error">{error}</p>}
        <p className="hint">Reception will receive the affected patient list and must contact all {affected.length} patients.</p>
      </Modal>
    </section>
  );
}