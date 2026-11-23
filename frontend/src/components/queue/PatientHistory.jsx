import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClinic, getPatientNotes, getPatientVisits } from "../../services/clinicStore";
import { fmtDate, fullName, typeLabel } from "../../utils/format";
import NoteCard from "./NoteCard";
import StatusBadge from "../common/StatusBadge";

// Full patient history shown inside the Queue page (no route of its own).
export default function PatientHistory({ patient, onBack }) {
  const s = useClinic();
  const navigate = useNavigate();
  const [tab, setTab] = useState("notes");
  const notes = getPatientNotes(s, patient.patientId);
  const visits = getPatientVisits(s, patient.patientId);
  return (
    <section className="card">
      <h2>Patient history &amp; notes</h2>
      <p><strong>{fullName(patient)}</strong><br /><span className="muted">{patient.patientId} · {patient.phone}</span></p>
      <p className="hint">Full patient history. Notes from all doctors are visible here.</p>
      <div className="tabs">
        <button className={tab === "notes" ? "tab active" : "tab"} onClick={() => setTab("notes")}>Clinical notes</button>
        <button className={tab === "visits" ? "tab active" : "tab"} onClick={() => setTab("visits")}>Visit history</button>
      </div>
      {tab === "notes" && (notes.length ? notes.map((n) => <NoteCard key={n.noteId} note={n} />) : <p className="empty">No clinical notes yet.</p>)}
      {tab === "visits" && (
        <table className="table">
          <thead><tr><th>Date</th><th>Visit</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>{visits.map((v) => (
            <tr key={v.visitId}><td>{fmtDate(v.date)}</td><td>{v.visitId}</td><td>{typeLabel(v.type)}</td><td><StatusBadge value={v.status} /></td></tr>
          ))}</tbody>
        </table>
      )}
      <div className="row-between">
        <button className="btn btn-soft" onClick={onBack}>Back to consultation</button>
        <button className="btn" onClick={() => navigate("/doctor/visits", { state: { assignPatientId: patient.patientId } })}>Assign follow-up appointment</button>
      </div>
    </section>
  );
}
