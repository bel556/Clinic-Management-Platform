import { useState } from "react";
import { useClinic, getPatient, getPatientNotes, addNote, setVisitStatus } from "../../services/clinicStore";
import { fmtDate, fullName, typeLabel } from "../../utils/format";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";
import NoteCard from "./NoteCard";
import PatientHistory from "./PatientHistory";

export default function ConsultationDetails({ visit, draft, onDraft }) {
  const s = useClinic();
  const patient = getPatient(s, visit.patientId);
  const notes = getPatientNotes(s, visit.patientId);
  const [modal, setModal] = useState(null); // "done" | "missed" | null
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);

  if (showHistory) return <PatientHistory patient={patient} onBack={() => setShowHistory(false)} />;

  const close = () => { setModal(null); setError(""); };
  const markDone = () => {
    if (draft.trim()) addNote({ patientId: visit.patientId, visitId: visit.visitId, content: draft.trim() });
    onDraft(""); setVisitStatus(visit.visitId, "done"); close();
  };
  const markMissed = () => {
    if (!reason.trim()) { setError("A reason is required."); return; }
    setVisitStatus(visit.visitId, "missed"); setReason(""); close();
  };
  const summary = (
    <div className="summary">
      {visit.queueNumber} · {fullName(patient)} · {patient.patientId}<br />{typeLabel(visit.type)} · Today
    </div>
  );

  return (
    <div className="stack">
      <section className="card">
        <p className="muted"><span className="qnum small">{visit.queueNumber}</span></p>
        <h2 className="big">{fullName(patient)} <small className="muted">({patient.patientId})</small></h2>
        <p className="muted">
          {patient.dob && <>DOB: {fmtDate(patient.dob)} · </>}Phone: {patient.phone} · Visit: {typeLabel(visit.type)} · {visit.visitId}
        </p>
        <p>Payment (read-only): <StatusBadge value={visit.paymentStatus} /></p>
        <button className="btn btn-soft" onClick={() => setShowHistory(true)}>View full patient profile &amp; history</button>
      </section>

      <section className="card">
        <h3>Medical history summary</h3>
        {notes.length ? notes.slice(0, 2).map((n) => <NoteCard key={n.noteId} note={n} />) : <p className="empty">No previous notes for this patient.</p>}
      </section>

      <section className="card">
        <h3>Consultation &amp; clinical notes</h3>
        <label className="field">
          <span>Clinical observations, diagnostic impression &amp; plan</span>
          <textarea rows={6} value={draft} onChange={(e) => { onDraft(e.target.value); setSaved(false); }} placeholder="Write the note for this consultation…" />
        </label>
        {saved && <p className="hint">Draft saved. It stays here until you mark the visit as done.</p>}
        <div className="row-between">
          <button className="btn btn-soft" onClick={() => setModal("missed")}>Mark as missed</button>
          <span>
            <button className="btn btn-soft" onClick={() => setSaved(true)}>Save draft</button>{" "}
            <button className="btn" onClick={() => setModal("done")}>Mark as done</button>
          </span>
        </div>
      </section>

      <Modal open={modal === "done"} eyebrow="Complete consultation" title="Mark this visit as done?"
        actions={<><button className="btn btn-soft" onClick={close}>Continue consultation</button><button className="btn" onClick={markDone}>Save &amp; mark as done</button></>}>
        <p>Your consultation note will be saved to the patient's history and this patient will leave the active queue.</p>
        {summary}
        <p className="hint">Payment stays {visit.paymentStatus === "paid" ? "Paid" : "Unpaid"}. Completing the consultation does not change billing.</p>
      </Modal>

      <Modal open={modal === "missed"} danger eyebrow="Patient not available" title="Mark this visit as missed?"
        actions={<><button className="btn btn-soft" onClick={close}>Keep in queue</button><button className="btn btn-danger" onClick={markMissed}>Mark as missed</button></>}>
        <p>This patient will leave the active queue. The visit and any saved notes remain in the patient's history.</p>
        {summary}
        <label className="field"><span>Reason *</span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Patient did not respond when called" /></label>
        {error && <p className="error">{error}</p>}
        <p className="hint">Payment status remains unchanged.</p>
      </Modal>
    </div>
  );
}
