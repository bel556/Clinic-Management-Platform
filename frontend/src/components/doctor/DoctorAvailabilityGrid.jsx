import { Badge, PresenceDot } from '../common'
import { cx } from '../common/cx'
import s from './doctor.module.css'

const CELL_CLASS = {
  Booked: s.cellBooked,
  Available: s.cellAvailable,
}

function isoWeek(value) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  return Math.ceil(((utc - yearStart) / 86400000 + 1) / 7)
}

function scheduleLabel(doctor) {
  const start = doctor?.startDay
  const end = doctor?.endDay
  if (!start && !end) return 'Schedule not recorded'
  const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)
  return `Schedule: ${start ? capitalize(start) : '—'} – ${end ? capitalize(end) : '—'}`
}

export function DoctorAvailabilityGrid({ data, loading }) {
  if (loading) {
    return <div className={s.gridCard}><p className="u-small u-muted" style={{ padding: 18 }}>Loading availability…</p></div>
  }
  if (!data) {
    return <div className={s.gridCard}><p className="u-small u-muted" style={{ padding: 18 }}>No doctors available. Register a doctor to see the weekly grid.</p></div>
  }

  const { doctor, days, slots, cells } = data

  return (
    <div className={s.gridCard}>
      <div className={s.gridHead}>
        <div>
          <p className={s.gridTitle}>{doctor.name}</p>
          <p className={s.gridMeta}>
            {doctor.department} · {doctor.room || 'No room'} · {scheduleLabel(doctor)}
          </p>
        </div>
        <div className={s.gridTags}>
          <PresenceDot present={doctor.present} />
          <Badge tone="green" dot>
            Available
          </Badge>
          <Badge tone="slate" dot>
            Booked
          </Badge>
          <span className="u-xs u-muted">
            {isoWeek(days[0]?.date) ? `WEEK ${isoWeek(days[0].date)}` : 'CURRENT WEEK'}
          </span>
        </div>
      </div>

      <div className={s.gridWrap}>
        <table className={s.grid}>
          <thead>
            <tr>
              <th>TIME</th>
              {days.map((day) => (
                <th key={day.key}>{day.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot}>
                <td className={s.timeCell}>{slot}</td>
                {days.map((day) => {
                  const cell = cells.find(
                    (item) => item.dayKey === day.key && item.slot === slot,
                  )
                  const state = cell?.state ?? 'Available'
                  return (
                    <td
                      key={`${day.key}-${slot}`}
                      className={cx(CELL_CLASS[state], day.key === 'Tue 29' && s.dayCellToday)}
                    >
                      {state}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={s.gridFoot}>
        <span className={s.legendItem}>
          <span className={cx(s.legendDot, s.legendBooked)} /> Booked
        </span>
        <span className={s.legendItem}>
          <span className={cx(s.legendDot, s.legendAvailable)} /> Available
        </span>
        <span className="u-right">Reception sees the same grid when booking appointments.</span>
      </div>
    </div>
  )
}
