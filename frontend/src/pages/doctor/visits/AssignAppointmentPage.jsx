import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarPlus, Search, UserRound } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  Field,
  InfoNote,
  Input,
  LoadingPane,
  SearchInput,
  Select,
  Textarea,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { STAFF } from '../../../services/mockDb'
import { availableSlots } from '../../../services/appointments'
import { getPatient, searchPatients } from '../../../services/patients'
import { createVisit } from '../../../services/visits'
import { useAsync, useDebouncedValue, useDocumentTitle } from '../../../utils/hooks'
import { formatDayLong } from '../../../utils/format'
import s from '../doctorPages.module.css'

const DOCTOR_ID = 'D-01'
const DOCTOR_NAME = STAFF.doctor.name

export default function AssignAppointmentPage() {
  useDocumentTitle('Assign new appointment')
  const navigate = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const patientId = params.get('patientId')

  const [query, setQuery] = useState('')
  const [date, setDate] = useState('2024-10-30')
  const [type, setType] = useState('Appointment')
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const debounced = useDebouncedValue(query, 180)
  const { data: patient, loading: patientLoading } = useAsync(
    () => (patientId ? getPatient(patientId) : Promise.resolve(null)),
    [patientId],
  )
  const { data: matches } = useAsync(
    () => (debounced.trim() ? searchPatients(debounced) : Promise.resolve([])),
    [debounced],
  )
  const { data: slots, loading: slotsLoading } = useAsync(
    () => (date ? availableSlots(DOCTOR_ID, date) : Promise.resolve([])),
    [date],
  )

  const submit = async (event) => {
    event.preventDefault()
    if (!patientId) {
      setError('Select a patient first')
      return
    }
    if (!date || !slot) {
      setError('Choose a date and an available time slot')
      return
    }
    setBusy(true)
    try {
      const visit = await createVisit({
        patientId,
        doctorId: DOCTOR_ID,
        date,
        slot,
        time: slot.split(' – ')[0],
        type,
        reason: [reason, notes].filter(Boolean).join(' — '),
        status: 'Upcoming',
      })
      toast.push(`Appointment ${visit.id} created and synced with reception.`)
      navigate('/doctor/visits')
    } finally {
      setBusy(false)
    }
  }

  if (!patientId) {
    return (
      <>
        <PageHeader
          title="Schedule appointment"
          description="Find the patient, then choose a date, time slot and reason for the visit."
          backTo="/doctor/visits"
          backLabel="Back to My Visits & Calendar"
        />
        <Card title="Select patient">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search patient by ID, name, or phone…"
            autoFocus
          />
          <div className={s.pickerList}>
            {matches?.length ? (
              matches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  className={s.pickerRow}
                  onClick={() => setParams({ patientId: match.id })}
                >
                  <UserRound size={13} />
                  <span className="u-strong">{match.fullName}</span>
                  <span className="u-mono u-xs u-muted">{match.id}</span>
                  <span className="u-xs u-muted">{match.phone}</span>
                  <span className="u-right u-row u-g4 u-teal">
                    <Search size={11} /> Select
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                icon={UserRound}
                title={debounced ? 'No matching patient' : 'Search for a patient'}
                description="Type a name, patient ID, or phone number."
              />
            )}
          </div>
        </Card>
      </>
    )
  }

  if (patientLoading) return <LoadingPane label="Loading patient…" />
  if (!patient) return <p className="u-muted">Patient not found.</p>

  return (
    <>
      <PageHeader
        title="Assign new appointment"
        description="Appointments immediately sync with patient records and the clinical queue."
        breadcrumb={[
          { label: 'My Visits & Calendar', to: '/doctor/visits' },
          { label: 'Assign new appointment' },
        ]}
        backTo="/doctor/visits"
        backLabel="Back to calendar"
      />

      <Card title="Appointment details">
        <form onSubmit={submit} noValidate>
          <div className={s.selectedPatient} style={{ marginBottom: 12 }}>
            <UserRound size={13} />
            <span className={s.selectedPatientName}>{patient.fullName}</span>
            <span className="u-mono u-xs u-muted">{patient.id}</span>
            <span className={s.muted}>{patient.phone}</span>
            <button
              type="button"
              className={`${s.linkBtn} u-right`}
              onClick={() => setParams({})}
            >
              Change patient
            </button>
          </div>

          <div className={s.formGrid}>
            <Field label="Date" required htmlFor="assign-date">
              <Input
                id="assign-date"
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setSlot('')
                  setError('')
                }}
              />
            </Field>

            <Field label="Available slot" required htmlFor="assign-slot">
              <Select
                id="assign-slot"
                value={slot}
                onChange={(event) => {
                  setSlot(event.target.value)
                  setError('')
                }}
                disabled={!slots?.length}
              >
                <option value="">
                  {slots?.length ? 'Select a time slot' : 'No available times'}
                </option>
                {(slots ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Doctor" htmlFor="assign-doctor">
              <Input id="assign-doctor" value={`${DOCTOR_NAME} · Cardiology`} readOnly />
            </Field>

            <Field label="Visit type" htmlFor="assign-type">
              <Select id="assign-type" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="Appointment">Follow-up appointment</option>
                <option value="Consultation">Consultation</option>
                <option value="Regular">Regular visit</option>
              </Select>
            </Field>

            <Field label="Reason for visit" required htmlFor="assign-reason" className={s.formFull}>
              <Input
                id="assign-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Follow-up consultation"
              />
            </Field>

            <Field
              label="Clinical notes & special instructions (optional)"
              htmlFor="assign-notes"
              className={s.formFull}
            >
              <Textarea
                id="assign-notes"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Wheelchair assistance needed; bring external lab work panel"
              />
            </Field>
          </div>

          {!slotsLoading && !slots?.length ? (
            <div style={{ marginTop: 12 }}>
              <InfoNote tone="danger" icon={CalendarPlus}>
                <strong>No available appointment slots</strong>
                <br />
                No slots available on {date ? formatDayLong(date) : 'the selected date'} for {DOCTOR_NAME}. Choose another date to
                continue. No appointment has been created and the patient&apos;s record is unchanged.
              </InfoNote>
            </div>
          ) : null}

          {error ? (
            <p className="u-small u-red" style={{ marginTop: 10 }}>
              {error}
            </p>
          ) : null}

          <div className={s.formFooter}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/doctor/visits')}>
              Cancel
            </Button>
            <span className={s.spacer} />
            {!slotsLoading && !slots?.length ? (
              <Button variant="primary" size="sm" onClick={() => setDate('')} type="button">
                Choose another date
              </Button>
            ) : (
              <Button variant="primary" size="sm" type="submit" disabled={busy || !slot}>
                {busy ? 'Creating…' : 'Confirm & create appointment'}
              </Button>
            )}
          </div>
        </form>
      </Card>

      <p className="u-xs u-muted" style={{ textAlign: 'center' }}>
        Appointments immediately sync with patient records and the clinical queue.
      </p>
    </>
  )
}
