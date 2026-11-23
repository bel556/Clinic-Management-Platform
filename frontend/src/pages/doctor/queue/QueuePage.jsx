import { useState } from "react";
import { useClinic, getQueue, getTodayVisits, getDoctor, TODAY } from "../../../services/clinicStore";
import { fmtDate } from "../../../utils/format";
import QueueList from "../../../components/queue/QueueList";
import ConsultationDetails from "../../../components/queue/ConsultationDetails";

export default function QueuePage() {
  const s = useClinic();
  const doctor = getDoctor(s);
  const queue = getQueue(s);
  const today = getTodayVisits(s);
  const processed = today.filter((v) => ["done", "missed"].includes(v.status)).length;
  const [selectedId, setSelectedId] = useState(null);
  const [drafts, setDrafts] = useState({}); // note drafts survive switching patients
  const active = queue.find((v) => v.visitId === selectedId) ?? queue[0];

  return (
    <>
      <header className="page-head">
        <h1>{doctor.name} <small className="muted">/ {doctor.specialty}</small></h1>
        <p className="muted">Queue for {fmtDate(TODAY)} · {processed} / {today.length} patients processed</p>
      </header>
      {!active ? (
        <div className="card empty-state"><h2>No patients waiting</h2><p className="muted">Patients appear here once reception checks them in.</p></div>
      ) : (
        <div className="queue-grid">
          <QueueList queue={queue} activeId={active.visitId} onSelect={setSelectedId} />
          <ConsultationDetails key={active.visitId} visit={active} draft={drafts[active.visitId] ?? ""}
            onDraft={(text) => setDrafts((d) => ({ ...d, [active.visitId]: text }))} />
        </div>
      )}
    </>
  );
}
