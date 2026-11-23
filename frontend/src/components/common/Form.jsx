import { cx } from './cx'
import s from './ui.module.css'

export function Field({ label, required, error, hint, htmlFor, className, children }) {
  return (
    <div className={cx(s.field, className)}>
      {label ? (
        <label className={s.label} htmlFor={htmlFor}>
          {label}
          {required ? <span className={s.required}>*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <span className={s.error}>{error}</span> : null}
      {!error && hint ? <span className={s.hint}>{hint}</span> : null}
    </div>
  )
}

export function Input({ invalid, className, ...rest }) {
  return <input className={cx(s.input, invalid && s.invalid, className)} {...rest} />
}

export function Select({ invalid, className, children, ...rest }) {
  return (
    <select className={cx(s.select, invalid && s.invalid, className)} {...rest}>
      {children}
    </select>
  )
}

export function Textarea({ invalid, className, ...rest }) {
  return <textarea className={cx(s.textarea, invalid && s.invalid, className)} {...rest} />
}

export function Toggle({ checked, onChange, label, description, id }) {
  return (
    <div className="u-between">
      <div>
        {label ? <div className="u-strong">{label}</div> : null}
        {description ? (
          <div className="u-small u-muted" style={{ marginTop: 2 }}>
            {description}
          </div>
        ) : null}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={s.toggle}
        onClick={() => onChange?.(!checked)}
      >
        <span className={cx(s.toggleTrack, checked && s.toggleTrackOn)}>
          <span className={s.toggleThumb} />
        </span>
      </button>
    </div>
  )
}

export function ReadOnly({ children, className }) {
  return <div className={cx(s.input, s.readonly, className)}>{children}</div>
}
