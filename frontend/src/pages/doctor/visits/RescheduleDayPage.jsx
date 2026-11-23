import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarSync, CheckCircle2 } from 'lucide-react'
import {
  Button,
  Card,
  Field,
  InfoNote,
  Input,
  LoadingPane,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { getAffectedVisits, rescheduleDay } from '../../../services/appointments'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { TOMORROW } from '../../../utils/constants'
import { formatDayLong, formatTime } from '../../../utils/format'
import s from '../doctorPages.module.css'

const DOCTOR_ID = 'D-01'

export default function RescheduleDayPage() {
  useDocumentTitle('Reschedule entire day')
  const navigate = useNavigate()
  const toast = useToast()
  const [original] = useState(TOMORROW)
  const [newDate, setNewDate] = useState('2024-10-31')
  const [reason, setReason] = useState('Change in clinic schedule')
  const [busy, setBusy] = useState(false)

  const { data, loading } = useAsync(() => getAffectedVisits(DOCTOR_ID, original), [original])

  const submit = async (event) => {
    event.preventDefault()
    if (!newDate || !reason.trim()) return
    setBusy(true)
    try {
      const moved = await rescheduleDay({
        doctorId: DOCTOR_ID,
        from: original,
        to: newDate,
        reason,
      })
      toast.push(`${moved.length} visits moved to ${newDate}. Reception notified.`)
      navigate('/doctor/visits')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingPane label="Preparing day reschedule…" />

  const visits = data?.visits ?? []

  return (
    <>
      <PageHeader
        title="Reschedule entire day"
        description="Move every visit to another day while preserving each patient's current time."
        breadcrumb={[
          { label: 'My Visits & Calendar', to: '/doctor/visits' },
          { label: 'Affected appointments', to: '/doctor/visits/day/affected' },
          { label: 'Reschedule entire day' },
        ]}
        backTo="/doctor/visits/day/affected"
        backLabel="Back to affected list"
      />

      <Card title="Choose a new day">
        <div className={s.selectedPatient} style={{ marginBottom: 12 }}>
          <CalendarSync size={12} />
          <span className={s.selectedPatientName}>Dr. Alexander Thorne</span>
          <span className="u-mono u-xs u-muted">· {formatDayLong(original)}</span>
          <span className={s.muted}>
            {visits.length} visits will move together. Preserve each patient&apos;s current time.
          </span>
        </div>

        <form onSubmit={submit}>
          <div className={s.formGrid}>
            <Field label="Original date" htmlFor="original-date">
              <Input id="original-date" type="date" value={original} readOnly />
            </Field>

            <Field label="New date" required htmlFor="new-date">
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(event) => setNewDate(event.target.value)}
              />
            </Field>

            <Field label="Reason" required htmlFor="day-reason" className={s.formFull}>
              <Input
                id="day-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Change in clinic schedule"
              />
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <InfoNote tone="blue" icon={CheckCircle2}>
              Availability checked · All {visits.length} original times are available on{' '}
              {newDate ? formatDayLong(newDate) : 'the new date'}. No overlapping bookings.
            </InfoNote>
          </div>

          <div style={{ marginTop: 14 }} className="u-scroll">
            <table className={s.mappingTable}>
              <thead>
                <tr>
                  <th>PATIENT</th>
                  <th>ORIGINAL SLOT</th>
                  <th>NEW SLOT</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <div className="u-strong">{visit.patientName}</div>
                      <div className="u-xs u-muted u-mono">{visit.patientId}</div>
                    </td>
                    <td className="u-nowrap">
                      {visit.dayLabel} · {formatTime(visit.date)}
                    </td>
                    <td className="u-nowrap u-teal">
                      {newDate ? new Date(`${newDate}T00:00:00`).getDate() : '—'} ·{' '}
                      {formatTime(visit.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12 }}>
            <InfoNote>
              Reception will receive the affected visit list and new times. Queue numbers will be
              assigned when patients check in on the new date.
            </InfoNote>
          </div>

          <div className={s.formFooter}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/doctor/visits/day/affected')}
            >
              Keep original schedule
            </Button>
            <span className={s.spacer} />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={busy || !newDate || newDate === original || !visits.length}
            >
              {busy ? 'Rescheduling…' : `Reschedule all ${visits.length} visits`}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
