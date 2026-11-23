import { useClinic, getDoctorName, getDoctor } from "../../services/clinicStore";
import { fmtDate } from "../../utils/format";

export default function NoteCard({ note }) {
  const s = useClinic();
  const doctor = getDoctor(s, note.doctorId);
  return (
    <article className="note">
      <header>
        <strong>{fmtDate(note.createdAt.slice(0, 10))} · {getDoctorName(s, note.doctorId)}</strong>
        <span className="muted">{doctor?.specialty} · {note.visitId}</span>
      </header>
      <p>{note.content}</p>
    </article>
  );
}
