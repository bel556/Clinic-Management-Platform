import { Lock, ShieldCheck, UserRound } from 'lucide-react'
import { Avatar, Badge, Button, Card, Toggle } from '../common'
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
    <Card
      title="Account information"
      icon={UserRound}
      action={action}
    >
      {note ? <p className={s.inlineNote} style={{ marginTop: 0, marginBottom: 10 }}>{note}</p> : null}
      <div className={s.accountGrid}>
        <InfoField label="Full name" value={user.name} />
        <InfoField label="Email" value={user.email} />
        <InfoField label="Role" value={role} />
        <InfoField label="Work location" value={location} />
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
          ? 'Present · Your account is visible for reception assignments and queue routing.'
          : 'Absent · You are off-duty. Your account information and existing visits are unchanged.'}
        <br />
        Presence is independent of your sign-in session. Logging out does not cancel visits.
      </div>
    </Card>
  )
}

export function AvailabilityCard({
  checked,
  onChange,
  title = 'Clinical availability',
  description = 'Manage real-time scheduling status for reception and emergency routing',
  extra,
}) {
  return (
    <Card title={title} icon={ShieldCheck}>
      <Toggle checked={checked} onChange={onChange} label="Available for scheduling" description={description} />
      {extra}
    </Card>
  )
}

export function SecurityCard({ pinUpdated, onReset }) {
  return (
    <Card title="Security & Terminal Access" icon={Lock}>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Workstation quick PIN</p>
          <p className={s.rowValue}>•••••• · Updated {pinUpdated}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onReset}>
          Reset PIN
        </Button>
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

export function PracticeNotesCard({ notes, detail }) {
  return (
    <Card
      title="Practice notes for reception desk"
      icon={UserRound}
      action={<Badge tone="slate">Internal</Badge>}
    >
      <p className="u-small u-muted">{notes}</p>
      <div className={s.segmentNote}>{detail}</div>
    </Card>
  )
}

export function AvailabilitySummaryCard({ user, availability }) {
  return (
    <Card title="Clinic availability" icon={ShieldCheck} action={<Badge tone={availability ? 'green' : 'slate'} dot>{availability ? 'Available' : 'Off duty'}</Badge>}>
      <p className="u-small u-muted">
        Manage real-time scheduling status for reception and emergency routing.
      </p>
      <div style={{ marginTop: 12 }}>
        <InfoField label="Assigned clinical space" value={user.assignedClinic} />
      </div>
      <div style={{ marginTop: 10 }}>
        <InfoField label="Default consultation slot" value={user.slotLength} />
      </div>
      <div className={s.shiftBox}>
        <span className="u-row u-g6">
          <span
            style={{
              display: 'inline-flex',
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'var(--teal-soft)',
              color: 'var(--teal)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={12} />
          </span>
          Standard shifts
        </span>
        <span className="u-strong">{user.shiftLabel}</span>
        <span className="u-row u-g6">
          <Badge tone="teal">{user.shiftHours.split(' — ')[0]}</Badge>
          <span className="u-muted">{user.shiftHours.split(' — ')[1]}</span>
        </span>
      </div>
    </Card>
  )
}

export function StaffStatsCard({ user }) {
  const stats = user.stats ?? {}
  return (
    <>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Today&apos;s shift velocity</p>
          <p className={s.rowValue}>Patients triaged compared with daily target</p>
        </div>
        <Badge tone="teal">{stats.patientsProcessed}</Badge>
      </div>
      <div className={s.statBar}>
        <div className={s.statBarFill} style={{ width: '82%' }} />
      </div>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Exception rate</p>
          <p className={s.rowValue}>Escalated registrations</p>
        </div>
        <span className="u-semibold u-small">{stats.exceptionRate}</span>
      </div>
      <div className={s.cardRow}>
        <div>
          <p className={s.rowLabel}>Average wait before check-in</p>
          <p className={s.rowValue}>Rolling 2-hour window</p>
        </div>
        <span className="u-semibold u-small">{stats.avgWait}</span>
      </div>
    </>
  )
}
