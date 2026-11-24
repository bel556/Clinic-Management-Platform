import { Activity, ArrowRight, ClipboardList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BillingBadge, EmptyState } from '../common'
import { now, patientRef } from '../../utils/format'
import s from './queue.module.css'

function waitMinutes(checkedInAt) {
  if (!checkedInAt) return null
  const minutes = Math.max(
    0,
    Math.round((now().getTime() - new Date(checkedInAt).getTime()) / 60000),
  )
  return minutes
}

export function QueueList({ queue, selectedId, onSelect }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 30000)
    return () => clearInterval(timer)
  }, [])

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
                  <span>ID: {patientRef(visit.patientId)}</span>
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

export function PulseTrace() {
  return (
    <div className={s.trace} aria-hidden="true">
      <svg viewBox="0 0 160 30" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 17h24l5-6 4 12 5-18 4 21 5-9h25l4-5 4 9 5-13 4 16 5-7h61" />
      </svg>
    </div>
  )
}


export function QueueIcon() {
  return <Activity size={14} />
}
