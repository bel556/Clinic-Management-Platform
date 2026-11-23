const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
export const fmtDate = (d) => { const [y, m, day] = d.split("-"); return `${+day} ${MONTHS[+m - 1]} ${y}`; };
export const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; };
export const fullName = (p) => (p ? `${p.firstName} ${p.lastName}` : "Unknown patient");
export const typeLabel = (t) => t.charAt(0).toUpperCase() + t.slice(1);
