import { Badge, PresenceDot } from '../common'
import { cx } from '../common/cx'
import s from './doctor.module.css'

const CELL_CLASS = {
  Booked: s.cellBooked,
  Available: s.cellAvailable,
  'Clinical recess': s.cellRecess,
}

export function DoctorAvailabilityGrid({ data, loading }) {
  if (loading || !data) {
    return <div className={s.gridCard}><p className="u-small u-muted" style={{ padding: 18 }}>Loading availability…</p></div>
  }

  const { doctor, days, slots, cells } = data

  return (
    <div className={s.gridCard}>
      <div className={s.gridHead}>
        <div>
          <p className={s.gridTitle}>{doctor.name}</p>
          <p className={s.gridMeta}>
            {doctor.department} · {doctor.suite ?? doctor.room} · Schedule: Mon–Fri
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
          <span className="u-xs u-muted">WEEK 44</span>
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
        <span className={s.legendItem}>
          <span className={cx(s.legendDot, s.legendRecess)} /> Clinical recess / rounds
        </span>
        <span className="u-right">Reception sees the same grid when booking appointments.</span>
      </div>
    </div>
  )
}
