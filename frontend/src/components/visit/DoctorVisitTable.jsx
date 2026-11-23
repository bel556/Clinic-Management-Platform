import StatusBadge from "../common/StatusBadge";
import { useClinic, getPatient } from "../../services/clinicStore";
import { fmtDate, fmtTime, fullName, typeLabel } from "../../utils/format";

export default function DoctorVisitTable({ visits, canAct, onModify, onCancel }) {
  const s = useClinic();
  if (!visits.length) return <p className="empty">No visits match. Try clearing the search or filters.</p>;
  return (
    <div className="scroll-x">
      <table className="table">
        <thead><tr><th>Date &amp; time</th><th>Patient</th><th>Type</th><th>Status</th><th>Billing</th>{canAct && <th>Actions</th>}</tr></thead>
        <tbody>
          {visits.map((v) => (
            <tr key={v.visitId}>
              <td><strong>{fmtDate(v.date)}</strong><br /><small className="muted">{fmtTime(v.time)}</small></td>
              <td><strong>{fullName(getPatient(s, v.patientId))}</strong><br /><small className="muted">{v.patientId} · {v.visitId}</small></td>
              <td>{typeLabel(v.type)}</td>
              <td><StatusBadge value={v.status} /></td>
              <td><StatusBadge value={v.paymentStatus} /></td>
              {canAct && (
                <td className="actions">
                  <button className="link" onClick={() => onModify(v)}>Modify</button>
                  <button className="link danger" onClick={() => onCancel(v)}>Cancel</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
