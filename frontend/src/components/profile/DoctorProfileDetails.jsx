import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClinic, getDoctor, setPresence } from "../../services/clinicStore";
import Modal from "../common/Modal";

export default function DoctorProfileDetails() {
  const doctor = getDoctor(useClinic());
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const logout = () => navigate("/"); // Sprint 1: no auth. Point at the team's landing / role-select route.
  return (
    <>
      <section className="card">
        <h2>Account information</h2>
        <p className="hint">Managed by Clinic Administration · Name and email are read-only.</p>
        <div className="two-col">
          <label className="field"><span>Full name</span><input value={doctor.name} readOnly /></label>
          <label className="field"><span>Email</span><input value={doctor.email} readOnly /></label>
          <label className="field"><span>Role</span><input value={`Doctor · ${doctor.specialty}`} readOnly /></label>
          <label className="field"><span>Work location</span><input value={doctor.location} readOnly /></label>
        </div>
      </section>
      <section className="card">
        <div className="row-between">
          <div><h2>Clinical availability</h2><p className="muted">Manage real-time scheduling status for reception and emergency routing.</p></div>
          <span className="switch-wrap">
            <strong>{doctor.presence === "present" ? "Present" : "Absent"}</strong>
            <button role="switch" aria-checked={doctor.presence === "present"} aria-label="Present or absent"
              className={"switch" + (doctor.presence === "present" ? " on" : "")}
              onClick={() => setPresence(doctor.presence === "present" ? "absent" : "present")}><span /></button>
          </span>
        </div>
      </section>
      <button className="btn btn-danger" onClick={() => setConfirm(true)}>Log out</button>
      <Modal open={confirm} danger eyebrow="End your session" title="Log out of CuraPulse?"
        actions={<><button className="btn btn-soft" onClick={() => setConfirm(false)}>Stay logged in</button><button className="btn btn-danger" onClick={logout}>Log out</button></>}>
        <p>Save any unsaved consultation notes before leaving. Logging out does not cancel appointments or change your presence status.</p>
      </Modal>
    </>
  );
}
