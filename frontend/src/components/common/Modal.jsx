// If Person 1 already has a Modal, delete this file and import theirs instead.
export default function Modal({ open, eyebrow, title, danger, children, actions }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        {eyebrow && <p className={"modal-eyebrow" + (danger ? " danger" : "")}>{eyebrow}</p>}
        <h2>{title}</h2>
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}
