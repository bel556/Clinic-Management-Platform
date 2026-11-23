import { Activity, Contact, Stethoscope } from 'lucide-react'
import { Avatar, Badge, Card, InfoNote, StatusBadge } from '../common'
import { formatAge, formatDate, formatDateShort } from '../../utils/format'
import s from './patient.module.css'

export function PatientHeaderCard({ patient, actions }) {
  return (
    <div className={s.headerCard}>
      <div className={s.headerMain}>
        <Avatar name={patient.fullName} size="xl" />
        <div>
          <h2 className={s.headerName}>{patient.fullName}</h2>
          <p className={s.headerMeta}>
            {patient.gender?.toUpperCase()}, {formatAge(patient.birthDate)}
            <span className="u-muted"> · {patient.id}</span>
          </p>
          {actions ? <div className="u-row u-g8" style={{ marginTop: 8 }}>{actions}</div> : null}
        </div>
      </div>

      <div className={s.headerStats}>
        <div>
          <p className={s.statLabel}>Blood type</p>
          <p className={s.statValue}>{patient.bloodType ?? '—'}</p>
        </div>
        <div>
          <p className={s.statLabel}>Primary physician</p>
          <p className={s.statValue}>{patient.primaryPhysician ?? '—'}</p>
        </div>
        <div>
          <p className={s.statLabel}>Registered</p>
          <p className={`${s.statValue} ${s.statValueTeal}`}>{formatDateShort(patient.registeredAt)}</p>
        </div>
      </div>
    </div>
  )
}

export function DemographicsCard({ patient }) {
  return (
    <Card title="Demographics & Contact" icon={Contact}>
      <div className={s.kvRow}>
        <span className={s.kvLabel}>Phone number</span>
        <span className={s.kvValue}>{patient.phone || '—'}</span>
      </div>
      <div className={s.kvRow}>
        <span className={s.kvLabel}>Email address</span>
        <span className={s.kvValue}>{patient.email || '—'}</span>
      </div>
      <div className={s.kvRow}>
        <span className={s.kvLabel}>Emergency contact</span>
        <span className={s.kvValue}>{patient.emergencyContact || '—'}</span>
      </div>
      <div className={s.kvRow}>
        <span className={s.kvLabel}>Additional info</span>
        <span className={s.kvValue}>{patient.additionalInfo || 'No additional information'}</span>
      </div>
    </Card>
  )
}

export function ClinicalBaselineCard({ patient }) {
  const vitals = patient.vitals ?? {}
  return (
    <Card
      title="Clinical Baselines"
      icon={Activity}
      action={
        vitals.recordedAt ? (
          <span className="u-xs u-muted">Last recorded {formatDate(vitals.recordedAt)}</span>
        ) : null
      }
    >
      <div>
        <p className={s.blockLabel}>Known allergies</p>
        {patient.allergies?.length ? (
          <ul className={s.bulletList}>
            {patient.allergies.map((allergy) => (
              <li key={allergy}>{allergy}</li>
            ))}
          </ul>
        ) : (
          <p className="u-small u-muted">No known allergies recorded.</p>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <p className={s.blockLabel}>Chronic conditions</p>
        {patient.conditions?.length ? (
          <ul className={s.bulletList}>
            {patient.conditions.map((condition) => (
              <li key={condition}>{condition}</li>
            ))}
          </ul>
        ) : (
          <p className="u-small u-muted">No chronic conditions recorded.</p>
        )}
      </div>

      <div className={s.vitalsGrid}>
        <div className={s.vitalCell}>
          <p className={s.statLabel}>Resting BP</p>
          <p className={s.vitalValue}>
            {vitals.bp ?? '—'}
            <span className={s.vitalUnit}>mmHg</span>
          </p>
        </div>
        <div className={s.vitalCell}>
          <p className={s.statLabel}>Heart rate</p>
          <p className={s.vitalValue}>
            {vitals.hr ?? '—'}
            <span className={s.vitalUnit}>bpm</span>
          </p>
        </div>
        <div className={s.vitalCell}>
          <p className={s.statLabel}>BMI metric</p>
          <p className={s.vitalValue}>{vitals.bmi ?? '—'}</p>
        </div>
      </div>
    </Card>
  )
}

export function PatientVisitsCard({
  visits,
  title = 'Recent & Upcoming Visits',
  onOpenVisit,
  action,
  empty,
}) {
  return (
    <Card
      title={title}
      icon={Stethoscope}
      action={action}
      padded={Boolean(empty)}
    >
      {visits.length ? (
        <div className="u-scroll">
          <table className="u-w100" style={{ fontSize: 12 }}>
            <thead>
              <tr>
                <th className="u-upper" style={{ textAlign: 'left', padding: '8px 18px' }}>
                  Date & time
                </th>
                <th className="u-upper" style={{ textAlign: 'left', padding: '8px 6px' }}>
                  Physician
                </th>
                <th className="u-upper" style={{ textAlign: 'left', padding: '8px 6px' }}>
                  Reason
                </th>
                <th className="u-upper" style={{ textAlign: 'left', padding: '8px 18px 8px 6px' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr
                  key={visit.id}
                  onClick={onOpenVisit ? () => onOpenVisit(visit) : undefined}
                  style={onOpenVisit ? { cursor: 'pointer' } : undefined}
                >
                  <td style={{ padding: '9px 18px', borderTop: '1px solid var(--border-soft)' }}>
                    <div className="u-strong">{visit.timeLabel}</div>
                    <div className="u-xs u-muted">{visit.dayLabel}</div>
                  </td>
                  <td style={{ padding: '9px 6px', borderTop: '1px solid var(--border-soft)' }}>
                    <div>{visit.doctorName}</div>
                    <div className="u-xs u-muted">{visit.specialty}</div>
                  </td>
                  <td style={{ padding: '9px 6px', borderTop: '1px solid var(--border-soft)' }}>
                    {visit.reason || visit.type}
                  </td>
                  <td style={{ padding: '9px 18px 9px 6px', borderTop: '1px solid var(--border-soft)' }}>
                    <StatusBadge status={visit.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        empty ?? <InfoNote>No visits recorded for this patient yet.</InfoNote>
      )}
    </Card>
  )
}

export function PatientSummaryLine({ patient, visit }) {
  return (
    <div className="u-row u-g8 u-wrap">
      <Badge tone="teal">{patient.id}</Badge>
      <span className="u-small u-muted">{patient.fullName}</span>
      {visit ? (
        <span className="u-xs u-muted">
          {visit.type} · Today, {visit.timeLabel}
          {visit.queue ? ` · ${visit.queueLabel}` : ''}
        </span>
      ) : null}
      {visit ? <StatusBadge status={visit.status} /> : null}
    </div>
  )
}
