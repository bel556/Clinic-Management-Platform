import { Info, Inbox, RotateCcw } from 'lucide-react'
import { Button } from './Button'
import { cx } from './cx'
import s from './ui.module.css'

export function EmptyState({ icon: Icon = Inbox, title, description, actions, className }) {
  return (
    <div className={cx(s.empty, className)}>
      <span className={s.emptyIcon}>
        <Icon size={18} strokeWidth={1.9} />
      </span>
      {title ? <p className={s.emptyTitle}>{title}</p> : null}
      {description ? <p className={s.emptyText}>{description}</p> : null}
      {actions ? <div className={s.emptyActions}>{actions}</div> : null}
    </div>
  )
}

export function InfoNote({ children, tone = 'default', icon, className }) {
  const Icon = icon ?? Info
  const tones = {
    default: '',
    danger: s.noteDanger,
    teal: s.noteTeal,
    blue: s.noteBlue,
  }
  return (
    <div className={cx(s.note, tones[tone], className)}>
      {Icon ? <Icon size={13} strokeWidth={2.1} /> : null}
      <div>{children}</div>
    </div>
  )
}

export function SectionHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cx(s.sectionHead, className)}>
      <div>
        {eyebrow ? <p className={s.eyebrow}>{eyebrow}</p> : null}
        <h1 className={s.sectionTitle}>{title}</h1>
        {description ? <p className={s.sectionDesc}>{description}</p> : null}
      </div>
      {actions ? <div className="u-row u-g8 u-wrap">{actions}</div> : null}
    </div>
  )
}

export function ErrorPane({ error, onRetry }) {
  const message =
    (typeof error === 'string' && error) ||
    error?.message ||
    'The clinic API did not respond.'
  return (
    <div className={cx(s.empty, s.noteDanger)}>
      <span className={s.emptyIcon}>
        <Info size={18} strokeWidth={1.9} />
      </span>
      <p className={s.emptyTitle}>Couldn&apos;t load this screen</p>
      <p className={s.emptyText}>{message}</p>
      {onRetry ? (
        <div className={s.emptyActions}>
          <Button variant="secondary" size="sm" icon={RotateCcw} onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export function Spinner({ className }) {
  return <span className={cx(s.spinner, className)} aria-hidden="true" />
}

export function LoadingPane({ label = 'Loading…' }) {
  return (
    <div className={s.loadingPane}>
      <Spinner />
      {label}
    </div>
  )
}
