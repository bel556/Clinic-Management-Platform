import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useClinic, getUpcoming, getHistory, getPatient, cancelVisit } from "../../../services/clinicStore";
import { fmtDate, fmtTime, fullName } from "../../../utils/format";
import Modal from "../../../components/common/Modal";
import DoctorVisitTable from "../../../components/visit/DoctorVisitTable";
import AssignAppointmentForm from "../../../components/visit/AssignAppointmentForm";
import RescheduleForm from "../../../components/visit/RescheduleForm";
import BulkActions from "../../../components/visit/BulkActions";

export default function DoctorVisitsPage() {
  const s = useClinic();
  const location = useLocation();
  const preselected = location.state?.assignPatientId; // set by "Assign follow-up appointment"
  const [view, setView] = useState(preselected ? "assign" : "list"); // list | assign | reschedule | day
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [date, setDate] = useState("all");
  const [target, setTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const upcoming = getUpcoming(s);
  const history = getHistory(s);
  const base = tab === "upcoming" ? upcoming : history;
  const rows = base.filter((v) => {
    const hay = `${fullName(getPatient(s, v.patientId))} ${v.patientId} ${v.visitId}`.toLowerCase();
    return hay.includes(query.toLowerCase()) && (type === "all" || v.type === type) && (date === "all" || v.date === date);
  });
  const dates = [...new Set(base.map((v) => v.date))];
  const back = () => setView("list");

  if (view === "assign") return <AssignAppointmentForm initialPatientId={preselected ?? ""} onCancel={back} onDone={back} />;
  if (view === "reschedule" && target) return <RescheduleForm visit={target} onCancel={back} onDone={back} />;
  if (view === "day") return <BulkActions onBack={back} />;

  const confirmCancel = () => {
    if (!reason.trim()) { setError("A reason is required."); return; }
    cancelVisit(cancelTarget.visitId, reason.trim());
    setCancelTarget(null); setReason(""); setError("");
  };

  return (
    <>
      <header className="page-head row-between">
        <div><h1>My visits</h1><p className="muted">{upcoming.length} upcoming · {history.length} past</p></div>
        <span>
          <button className="btn btn-soft" onClick={() => setView("day")}>Cancel entire day</button>{" "}
          <button className="btn" onClick={() => setView("assign")}>Assign new appointment</button>
        </span>
      </header>
      <section className="card">
        <div className="tabs">
          {["upcoming", "history"].map((t) => (
            <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => { setTab(t); setDate("all"); }}>
              {t === "upcoming" ? `Upcoming (${upcoming.length})` : `History (${history.length})`}
            </button>
          ))}
        </div>
        <div className="filters">
          <input type="search" placeholder="Search by patient name, ID or visit ID" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date">
            <option value="all">All days</option>{dates.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option><option value="regular">Regular</option><option value="appointment">Appointment</option><option value="consultation">Consultation</option>
          </select>
        </div>
        <DoctorVisitTable visits={rows} canAct={tab === "upcoming"}
          onModify={(v) => { setTarget(v); setView("reschedule"); }}
          onCancel={(v) => { setCancelTarget(v); setReason(""); setError(""); }} />
        {tab === "history" && <p className="hint">Past visits cannot be cancelled or rescheduled.</p>}
      </section>

      <Modal open={!!cancelTarget} danger eyebrow="Cancel appointment" title="Cancel this appointment?"
        actions={<><button className="btn btn-soft" onClick={() => setCancelTarget(null)}>Keep appointment</button><button className="btn btn-danger" onClick={confirmCancel}>Cancel appointment</button></>}>
        {cancelTarget && <>
          <p>Reception will receive a cancellation notification with the affected visit and will contact the patient.</p>
          <div className="summary">{fullName(getPatient(s, cancelTarget.patientId))} · {cancelTarget.patientId}<br />{fmtDate(cancelTarget.date)} · {fmtTime(cancelTarget.time)}</div>
          <label className="field"><span>Reason *</span><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Emergency procedure in surgical wing B" /></label>
          {error && <p className="error">{error}</p>}
          <p className="hint">The visit is kept as Cancelled for reception to review.</p>
        </>}
      </Modal>
    </>
  );
}
