import { NavLink, Outlet } from "react-router-dom";
import { useClinic, getDoctor, TODAY } from "../services/clinicStore";
import { fmtDate } from "../utils/format";
import "../styles/doctor.css";

const links = [["queue", "Queue"], ["visits", "Visits"], ["profile", "Profile"]];

export default function DoctorLayout() {
  const doctor = getDoctor(useClinic());
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">♥</span> CuraPulse</div>
        <p className="nav-group">Doctor</p>
        <nav>
          {links.map(([to, label]) => (
            <NavLink key={to} to={`/doctor/${to}`} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <span><strong>Downtown Medical Center</strong> <span className="muted">· {fmtDate(TODAY)}</span></span>
          <span className="who">{doctor.name}</span>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
