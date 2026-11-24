import { Info, Stethoscope } from 'lucide-react'
import { Badge, PresenceDot } from '../common'
import { cx } from '../common/cx'
import s from './doctor.module.css'

export function DoctorList({ doctors, selectedId, onSelect, loading }) {
  const attending = doctors.filter((doctor) => doctor.present).length

  return (
    <div className={s.listCard}>
      <div className={s.listHead}>
        <span className={s.listLabel}>Attending physicians ({attending})</span>
        <span className="u-xs u-muted">Live directory</span>
      </div>

      {loading ? <p className="u-small u-muted">Loading doctors…</p> : null}

      {doctors.map((doctor) => (
        <button
          key={doctor.id}
          type="button"
          className={cx(s.doctorRow, selectedId === doctor.id && s.doctorRowActive)}
          onClick={() => onSelect(doctor.id)}
        >
          <span
            style={{
              display: 'inline-flex',
              width: 26,
              height: 26,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 7,
              background: 'var(--panel)',
              color: 'var(--teal)',
              flex: 'none',
            }}
          >
            <Stethoscope size={13} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span className={s.doctorName}>
              {doctor.name}
              {doctor.present ? <PresenceDot present label="Present" /> : null}
            </span>
            <span className={s.doctorMeta}>
              {doctor.specialty} · {doctor.room}
            </span>
          </span>
          <span className={s.doctorRight}>
            {doctor.present ? (
              <span className={s.queueText}>
                {doctor.queueCount} in queue
              </span>
            ) : (
              <Badge tone="slate">{doctor.note ?? 'Absent'}</Badge>
            )}
          </span>
        </button>
      ))}

      <div className={s.rosterCard}>
        <Info size={13} style={{ marginTop: 1, flex: 'none' }} />
        <div>
          <strong>Roster mode: Receptionist (Read-Only)</strong>
          Availability changes are managed by HR. Reception can only view the
          booking state and queue depth.
        </div>
      </div>
    </div>
  )
}
