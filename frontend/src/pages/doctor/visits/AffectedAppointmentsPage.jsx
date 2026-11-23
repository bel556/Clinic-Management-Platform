import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Ban, CalendarSync, Info } from 'lucide-react'
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  InfoNote,
  LoadingPane,
  Textarea,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { cancelDay, getAffectedVisits } from '../../../services/appointments'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { TOMORROW } from '../../../utils/constants'
import { formatDayLong, formatTime } from '../../../utils/format'
import s from '../doctorPages.module.css'

const DOCTOR_ID = 'D-01'

export default function AffectedAppointmentsPage() {
  useDocumentTitle('Affected appointments')
  const navigate = useNavigate()
  const toast = useToast()
  const [day, setDay] = useState(TOMORROW)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const { data, loading, reload } = useAsync(
    () => getAffectedVisits(DOCTOR_ID, day),
    [day],
  )

  const confirmCancel = async () => {
    if (!reason.trim()) return
    setBusy(true)
    try {
      const affected = await cancelDay({ doctorId: DOCTOR_ID, date: day, reason })
      toast.push(`${affected.length} visits cancelled. Reception notified.`)
      setCancelOpen(false)
      navigate('/doctor/visits')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="My visits · Day-wide changes"
        title="Affected appointments"
        description={formatDayLong(day)}
        backTo="/doctor/visits"
        backLabel="Back to calendar"
        actions={
          <Field label="Day" htmlFor="affected-day">
            <input
              id="affected-day"
              type="date"
              value={day}
              onChange={(event) => {
                setDay(event.target.value)
                reload()
              }}
              style={{
                height: 33,
                padding: '0 10px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12.5,
              }}
            />
          </Field>
        }
      />

      <InfoNote icon={Info}>
        {data?.visits.length ?? 0} upcoming visits for Dr. Alexander Thorne ·{' '}
        {data?.appointments ?? 0} appointments and {data?.consultations ?? 0} consultations. Only
        this doctor&apos;s visits on the selected day are affected.
      </InfoNote>

      {loading ? (
        <LoadingPane label="Loading affected visits…" />
      ) : (
        <Card title={`Review all ${data?.visits.length ?? 0} patients`} padded={false}>
          <div className="u-scroll">
            <table className={s.mappingTable}>
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>PATIENT / ID</th>
                  <th>VISIT TYPE</th>
                  <th>PAYMENT</th>
                </tr>
              </thead>
              <tbody>
                {data?.visits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="u-nowrap">{formatTime(visit.date)}</td>
                    <td>
                      <div className="u-strong">{visit.patientName}</div>
                      <div className="u-xs u-muted u-mono">{visit.patientId}</div>
                    </td>
                    <td>{visit.type}</td>
                    <td>{visit.billing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="u-between u-wrap" style={{ padding: '10px 14px', borderTop: '1px solid var(--border-soft)' }}>
            <span className="u-xs u-muted">
              {data?.visits.length ?? 0} of {data?.visits.length ?? 0} visits shown · No visits have
              been changed yet.
            </span>
            <div className="u-row u-g6 u-wrap">
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate('/doctor/visits')}
              >
                Back to calendar
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CalendarSync}
                onClick={() => navigate('/doctor/visits/day/reschedule')}
              >
                Reschedule entire day
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Ban}
                onClick={() => setCancelOpen(true)}
              >
                Cancel entire day
              </Button>
            </div>
          </div>
        </Card>
      )}

      <InfoNote>
        Reception is notified after you confirm a change. Payment statuses remain unchanged.
      </InfoNote>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        busy={busy}
        eyebrow="Doctor · Day-wide change"
        title={`Cancel all ${data?.visits.length ?? 0} appointments?`}
        description="All appointments and consultations on this day will be cancelled for Dr. Alexander Thorne. Today's queue is not affected."
        icon={Ban}
        tone="danger"
        confirmDisabled={!reason.trim()}
        summary={
          <>
            <strong>{formatDayLong(day)}</strong>
            <br />
            {data?.visits.length ?? 0} patients ·{' '}
            {data?.appointments ?? 0} appointments · {data?.consultations ?? 0} consultations
          </>
        }
        confirmLabel={`Cancel all ${data?.visits.length ?? 0} visits`}
        cancelLabel="Keep schedule"
      >
        <div style={{ marginTop: 10 }}>
          <Field label="Reason" required>
            <Textarea
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Emergency medical leave"
            />
          </Field>
          <p className="u-xs u-muted" style={{ marginTop: 8 }}>
            Reception will receive the affected patient list and must contact all{' '}
            {data?.visits.length ?? 0} patients.
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}
