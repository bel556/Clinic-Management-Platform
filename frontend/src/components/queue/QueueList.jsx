import StatusBadge from "../common/StatusBadge";
import { useClinic, getPatient } from "../../services/clinicStore";
import { fullName, typeLabel } from "../../utils/format";

export default function QueueList({ queue, activeId, onSelect }) {
  const s = useClinic();
  return (
    <aside className="card queue-list">
      <h2>Today's queue</h2>
      <p className="muted">{queue.length} {queue.length === 1 ? "patient" : "patients"} awaiting examination</p>
      <ul>
        {queue.map((v) => (
          <li key={v.visitId}>
            <button className={"queue-item" + (v.visitId === activeId ? " active" : "")} onClick={() => onSelect(v.visitId)}>
              <span className="qnum">{v.queueNumber}</span>
              <span className="qmain">
                <strong>{fullName(getPatient(s, v.patientId))}</strong>
                <small>{v.patientId} · {typeLabel(v.type)}</small>
              </span>
              <StatusBadge value={v.paymentStatus} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
