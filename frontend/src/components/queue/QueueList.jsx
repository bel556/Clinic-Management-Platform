import { Activity, ArrowRight, ClipboardList } from 'lucide-react'
import { BillingBadge, EmptyState } from '../common'
import { DEMO_NOW } from '../../utils/constants'
import s from './queue.module.css'

function waitMinutes(checkedInAt) {
  if (!checkedInAt) return null
  const minutes = Math.max(
    0,
    Math.round((DEMO_NOW.getTime() - new Date(checkedInAt).getTime()) / 60000),
  )
  return minutes
}

export function QueueList({ queue, selectedId, onSelect }) {
  return (
    <div className={s.queueCard}>
      <div className={s.queueHead}>
        <div className="u-between">
          <div>
            <p className={s.queueTitle}>Today&apos;s Queue</p>
            <p className={s.queueSub}>
              {queue.length} {queue.length === 1 ? 'patient' : 'patients'} awaiting examination
            </p>
          </div>
          <span className={s.liveTag}>Live roster</span>
        </div>
      </div>

      <div className={s.queueList}>
        {queue.length ? (
          queue.map((visit) => {
            const minutes = waitMinutes(visit.checkedInAt)
            return (
              <button
                key={visit.id}
                type="button"
                className={`${s.queueItem} ${selectedId === visit.id ? s.queueItemActive : ''}`}
                onClick={() => onSelect(visit.id)}
              >
                <div className={s.queueTop}>
                  <span className={s.queueNumber}>{visit.queueLabel}</span>
                  <span className={s.queueName}>{visit.patientName}</span>
                  {minutes !== null ? (
                    <span className={s.waitChip}>Wait {minutes}m</span>
                  ) : null}
                </div>
                <div className={s.queueMeta}>
                  <span>ID: {visit.patientId}</span>
                  <span className={s.queueMetaDivider} />
                  <span>Visit: {visit.type}</span>
                </div>
                <div className={s.queueFoot}>
                  <span className="u-row u-g4">
                    <span className="u-muted" style={{ fontSize: 9 }}>Billing:</span>
                    <BillingBadge billing={visit.billing} />
                  </span>
                  <span className={s.queueFootTeal}>
                    Active Encounter <ArrowRight size={10} style={{ verticalAlign: '-1px' }} />
                  </span>
                </div>
              </button>
            )
          })
        ) : (
          <div className={s.queueEmpty}>
            <EmptyState
              icon={ClipboardList}
              title="Queue is clear"
              description="No patients are waiting for this doctor right now."
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function VitalsBaselineCard({ vitals }) {
  if (!vitals) return null
  return (
    <div className={s.vitalsCard}>
      <div className={s.vitalsCardHead}>
        <span>Today&apos;s vitals baseline</span>
        <span style={{ color: 'var(--teal)' }}>Auto-synced</span>
      </div>
      <div className={s.vitalsRow}>
        <div className={s.vitalBox}>
          <p className={s.vitalLabel}>Target BP range</p>
          <p className={s.vitalValue}>
            {vitals.bp}
            <span className={s.vitalUnit}>mmHg</span>
          </p>
        </div>
        <div className={s.vitalBox}>
          <p className={s.vitalLabel}>Resting HR mean</p>
          <p className={s.vitalValue}>
            {vitals.hr}
            <span className={s.vitalUnit}>BPM</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export function PulseTrace() {
  return (
    <div className={s.trace} aria-hidden="true">
      <svg viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 17h24l5-6 4 12 5-18 4 21 5-9h25l4-5 4 9 5-13 4 16 5-7h61" />
      </svg>
    </div>
  )
}

export function VitalsStrip({ vitals, recordedAt }) {
  return (
    <div className={s.vitalStrip}>
      <div className={s.stripCell}>
        <p className={s.stripLabel}>Last recorded blood pressure</p>
        <p className={s.stripValue}>
          {vitals?.bp ?? '—'}
          <span className={s.stripUnit}>mmHg</span>
        </p>
      </div>
      <div className={s.stripCell}>
        <p className={s.stripLabel}>Resting pulse</p>
        <p className={s.stripValue}>
          {vitals?.hr ?? '—'}
          <span className={s.stripUnit}>BPM</span>
        </p>
      </div>
      <PulseTrace />
      {recordedAt ? (
        <div className={s.stripCell} style={{ maxWidth: 120 }}>
          <p className={s.stripLabel}>Recorded</p>
          <p className={s.stripValue} style={{ fontSize: 11, fontWeight: 500 }}>
            {recordedAt}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function QueueIcon() {
  return <Activity size={14} />
}
