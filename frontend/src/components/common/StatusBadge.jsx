const LABELS = { upcoming: "Upcoming", present: "Waiting", done: "Done", missed: "Missed", cancelled: "Cancelled", paid: "Paid", unpaid: "Unpaid" };
export default function StatusBadge({ value }) {
  return <span className={`badge badge-${value}`}>{LABELS[value] ?? value}</span>;
}
