import { ShieldCheck, UserRound } from 'lucide-react'
import { Avatar, Badge, Card } from '../common'
import s from './profile.module.css'

export function InfoField({ label, value, plain = false }) {
  return (
    <div>
      <p className={s.fieldLabel}>{label}</p>
      <div className={`${s.fieldValue} ${plain ? s.fieldValuePlain : ''}`}>{value}</div>
    </div>
  )
}

export function AccountInfoCard({ user, role, location, note, action }) {
  return (
    <Card title="Account information" icon={UserRound} action={action}>
      {note ? (
        <p className={s.inlineNote} style={{ marginTop: 0, marginBottom: 10 }}>
          {note}
        </p>
      ) : null}
      <div className={s.accountGrid}>
        <InfoField label="Full name" value={user.name} />
        <InfoField label="Email" value={user.email || '—'} />
        <InfoField label="Role" value={role} />
        <InfoField label="Work location" value={location || '—'} />
      </div>
    </Card>
  )
}

export function PresenceCard({ value, onChange, action }) {
  const options = ['Present', 'Absent']
  return (
    <Card title="Clinic presence" icon={ShieldCheck} action={action}>
      <div className="u-row u-g10 u-wrap">
        <span className="u-small u-muted">Choose whether you are present at the clinic.</span>
        <div className={s.segment} style={{ marginLeft: 'auto' }}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={`${s.segmentBtn} ${value === option ? s.segmentActive : ''}`}
              onClick={() => onChange?.(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className={s.segmentNote}>
        {value === 'Present'
          ? 'Present · Reception can assign new visits to you.'
          : 'Absent · You are off duty. Existing visits are unchanged.'}
      </div>
    </Card>
  )
}

export function ProfileHero({ user, tags }) {
  return (
    <div className={s.hero}>
      <Avatar name={user.name} size="xl" />
      <div>
        <div className={s.heroName}>{user.name}</div>
        <div className={s.heroMeta}>{user.role}</div>
      </div>
      {tags?.length ? (
        <div className={s.heroTags}>
          {tags.map((tag) => (
            <div key={tag.label}>
              <p className={s.tagLabel}>{tag.label}</p>
              <p className={`${s.tagValue} ${tag.teal ? s.tagValueTeal : ''}`}>{tag.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Daily operational stats, computed from today's visits (no stored counters). */
export function StaffStatsCard({ stats = {} }) {
  const { completed = 0, total = 0, exceptionRate = '—', avgWait = '—', waiting = 0 } = stats
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Visits completed today</p>
          <p className={s.rowValue}>
            {completed} of {total} scheduled
          </p>
        </div>
        <Badge tone="teal">
          {completed} / {total}
        </Badge>
      </div>
      <div className={s.statBar}>
        <div className={s.statBarFill} style={{ width: `${percent}%` }} />
      </div>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Exception rate</p>
          <p className={s.rowValue}>Missed or cancelled visits</p>
        </div>
        <span className="u-semibold u-small">{exceptionRate}</span>
      </div>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Average wait</p>
          <p className={s.rowValue}>{waiting} patient(s) currently waiting</p>
        </div>
        <span className="u-semibold u-small">{avgWait}</span>
      </div>
    </>
  )
}
