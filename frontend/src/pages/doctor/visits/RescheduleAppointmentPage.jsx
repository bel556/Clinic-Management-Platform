import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, RefreshCw } from 'lucide-react'
import {
  Button,
  Card,
  Field,
  InfoNote,
  Input,
  LoadingPane,
  Select,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { availableSlots, rescheduleAppointment } from '../../../services/appointments'
import { getVisit } from '../../../services/visits'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { formatDate } from '../../../utils/format'
import s from '../doctorPages.module.css'

export default function RescheduleAppointmentPage() {
  useDocumentTitle('Reschedule appointment')
  const navigate = useNavigate()
  const toast = useToast()
  const { visitId } = useParams()
  const { data: visit, loading } = useAsync(() => getVisit(visitId), [visitId])
  const [date, setDate] = useState('2024-10-30')
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  const { data: slots, loading: slotsLoading } = useAsync(
    () => availableSlots(visit?.doctorId ?? 'D-01', date),
    [visit?.doctorId, date],
  )

  if (loading) return <LoadingPane label="Loading appointment…" />
  if (!visit) return <p className="u-muted">Visit not found.</p>

  const submit = async (event) => {
    event.preventDefault()
    if (!slot) return
    setBusy(true)
    try {
      await rescheduleAppointment(visit.id, { date, slot, reason })
      toast.push('Appointment rescheduled. Reception has been notified.')
      navigate('/doctor/visits')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Reschedule appointment"
        breadcrumb={[
          { label: 'My Visits & Calendar', to: '/doctor/visits' },
          { label: visit.patientName, to: '/doctor/visits' },
          { label: 'Reschedule' },
        ]}
        backTo="/doctor/visits"
        backLabel="Back to calendar"
      />

      <Card title="Appointment details">
        <div className={s.selectedPatient} style={{ marginBottom: 12 }}>
          <RefreshCw size={12} />
          <span className={s.selectedPatientName}>{visit.patientName}</span>
          <span className="u-mono u-xs u-muted">{visit.patientId}</span>
          <span className="u-mono u-xs u-muted">· {visit.id}</span>
          <span className={s.muted}>
            Current slot: Today, {formatDate(visit.date)} · {visit.timeLabel}
          </span>
        </div>

        <form onSubmit={submit}>
          <div className={s.formGrid}>
            <Field label="New date" required htmlFor="reschedule-date">
              <Input
                id="reschedule-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setSlot('')
                }}
              />
            </Field>

            <Field label="Available slot" required htmlFor="reschedule-slot">
              <Select
                id="reschedule-slot"
                value={slot}
                onChange={(event) => setSlot(event.target.value)}
                disabled={!slots?.length}
              >
                <option value="">
                  {slotsLoading ? 'Checking availability…' : slots?.length ? 'Select a time slot' : 'No available times'}
                </option>
                {(slots ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Doctor" htmlFor="reschedule-doctor" className={s.formFull}>
              <Input
                id="reschedule-doctor"
                value={`${visit.doctorName} · ${visit.specialty} (read-only)`}
                readOnly
              />
            </Field>

            <Field label="Reason" required htmlFor="reschedule-reason" className={s.formFull}>
              <Input
                id="reschedule-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Emergency procedure in surgical wing B"
              />
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <InfoNote tone="blue" icon={CalendarClock}>
              The appointment stays <strong>Upcoming</strong>. Reception receives a notification
              showing the old and new time and will inform the patient. Queue number is assigned only
              at check-in.
            </InfoNote>
          </div>

          <div className={s.formFooter}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/doctor/visits')}>
              Keep current time
            </Button>
            <span className={s.spacer} />
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={busy || !slot || !reason.trim()}
            >
              {busy ? 'Rescheduling…' : 'Confirm reschedule'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
