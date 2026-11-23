import { Check, CircleAlert, CircleDashed } from 'lucide-react'
import { VISIT_STATUS } from '../../utils/constants'
import { cx } from './cx'
import s from './ui.module.css'

const TONES = {
  green: s.toneGreen,
  blue: s.toneBlue,
  red: s.toneRed,
  amber: s.toneAmber,
  slate: s.toneSlate,
  teal: s.toneTeal,
  violet: s.toneViolet,
}

export function Badge({ tone = 'slate', dot = false, icon: Icon, className, children }) {
  return (
    <span className={cx(s.badge, TONES[tone] ?? s.toneSlate, className)}>
      {dot ? <span className={s.badgeDot} /> : null}
      {Icon ? <Icon size={10} strokeWidth={2.6} /> : null}
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const meta = VISIT_STATUS[status] ?? { label: status, tone: 'slate' }
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  )
}

export function BillingBadge({ billing }) {
  if (billing === 'Paid') {
    return (
      <Badge tone="green" icon={Check}>
        Paid
      </Badge>
    )
  }
  return (
    <Badge tone="slate" icon={CircleDashed}>
      Unpaid
    </Badge>
  )
}

export function PresenceDot({ present, label }) {
  return (
    <Badge tone={present ? 'green' : 'slate'} dot>
      {label ?? (present ? 'Present' : 'Absent')}
    </Badge>
  )
}

export function PriorityBadge({ kind }) {
  if (kind === 'high') {
    return (
      <Badge tone="red" icon={CircleAlert}>
        High priority · Action required
      </Badge>
    )
  }
  if (kind === 'action') {
    return (
      <Badge tone="teal" icon={CircleAlert}>
        Action required
      </Badge>
    )
  }
  if (kind === 'roster') {
    return <Badge tone="slate">Roster event</Badge>
  }
  return (
    <Badge tone="green" icon={Check}>
      Handled
    </Badge>
  )
}
