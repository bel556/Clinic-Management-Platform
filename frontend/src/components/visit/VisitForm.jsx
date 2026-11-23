import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, Info } from 'lucide-react'
import { Button, Field, InfoNote, Input, Select, Textarea } from '../common'
import { availableSlots } from '../../services/appointments'
import { SPECIALTIES, TIME_SLOTS } from '../../utils/constants'
import { formatDayLong } from '../../utils/format'
import s from './visit.module.css'

export function VisitForm({
  patient,
  doctors,
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Create appointment',
  checkInLabel,
  onCheckIn,
  onDirty,
  busy = false,
}) {
  const [type, setType] = useState(initial?.type ?? 'Appointment')
  const [date, setDate] = useState(initial?.dayKey ?? '2024-10-30')
  const [specialty, setSpecialty] = useState(initial?.specialty ?? 'Cardiology')
  const [doctorId, setDoctorId] = useState(initial?.doctorId ?? '')
  const [slot, setSlot] = useState(initial?.slot ?? '')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [slots, setSlots] = useState(TIME_SLOTS)
  const [errors, setErrors] = useState({})

  const specialtyDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.specialty === specialty),
    [doctors, specialty],
  )

  const effectiveDoctorId = doctorId || specialtyDoctors[0]?.id || ''

  useEffect(() => {
    let alive = true
    if (!effectiveDoctorId) return undefined
    availableSlots(effectiveDoctorId, date).then((rows) => {
      if (!alive) return
      if (initial?.slot && !rows.includes(initial.slot)) {
        setSlots([initial.slot, ...rows])
      } else {
        setSlots(rows)
      }
    })
    return () => {
      alive = false
    }
  }, [effectiveDoctorId, date, initial?.slot])

  const update = (setter) => (value) => {
    setter(value)
    onDirty?.()
  }

  const handleSpecialty = (value) => {
    setSpecialty(value)
    setDoctorId('')
    setSlot('')
    onDirty?.()
  }

  const buildPayload = () => ({
    patientId: patient?.id,
    doctorId: effectiveDoctorId,
    specialty,
    date,
    slot,
    time: slot.split(' – ')[0],
    type,
    reason,
  })

  const validate = () => {
    const next = {}
    if (!date) next.date = 'Choose a date'
    if (!effectiveDoctorId) next.doctorId = 'Select an available doctor'
    if (!slot) next.slot = 'Select a time slot'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    if (!validate()) return
    onSubmit?.(buildPayload())
  }

  return (
    <form onSubmit={submit} noValidate>
      {patient ? (
        <div className={s.patientBanner}>
          <span className="u-strong">{patient.fullName ?? `${patient.firstName} ${patient.lastName}`}</span>
          <span className={s.patientBannerId}>{patient.id}</span>
          <span className="u-muted">{patient.phone}</span>
        </div>
      ) : null}

      <div className={s.formGrid}>
        <Field label="Visit type" required className={s.formGridFull}>
          <div className={s.typeRow}>
            {['Regular', 'Appointment', 'Consultation'].map((option) => (
              <button
                key={option}
                type="button"
                className={`${s.typePill} ${type === option ? s.typePillActive : ''}`}
                onClick={() => update(setType)(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Date" required error={errors.date} htmlFor="visit-date">
          <Input
            id="visit-date"
            type="date"
            value={date}
            onChange={(event) => update(setDate)(event.target.value)}
            invalid={Boolean(errors.date)}
          />
        </Field>

        <Field label="Specialty" required htmlFor="visit-specialty">
          <Select
            id="visit-specialty"
            value={specialty}
            onChange={(event) => handleSpecialty(event.target.value)}
          >
            {SPECIALTIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Available doctor" required error={errors.doctorId} htmlFor="visit-doctor">
          <Select
            id="visit-doctor"
            value={effectiveDoctorId}
            onChange={(event) => {
              update(setDoctorId)(event.target.value)
              setSlot('')
            }}
            invalid={Boolean(errors.doctorId)}
          >
            <option value="">Select a doctor</option>
            {specialtyDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} · {doctor.present ? 'Present' : 'Absent'}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Available time slot" required error={errors.slot} htmlFor="visit-slot">
          <Select
            id="visit-slot"
            value={slot}
            onChange={(event) => update(setSlot)(event.target.value)}
            invalid={Boolean(errors.slot)}
            disabled={!slots.length}
          >
            <option value="">
              {slots.length ? 'Select a time slot' : 'No available times'}
            </option>
            {slots.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Reason / details" htmlFor="visit-reason" className={s.formGridFull}>
          <Textarea
            id="visit-reason"
            rows={2}
            value={reason}
            onChange={(event) => update(setReason)(event.target.value)}
            placeholder="Follow-up consultation and blood pressure review"
          />
        </Field>
      </div>

      <div style={{ marginTop: 12 }}>
        <InfoNote tone={slots.length ? 'blue' : 'danger'} icon={slots.length ? Info : CalendarCheck}>
          {slots.length ? (
            <>
              {specialty} · {slots.length} available {slots.length === 1 ? 'slot' : 'slots'}:{' '}
              {slots.slice(0, 4).join(', ')}
              {slots.length > 4 ? '…' : '.'} Only available doctors and slots can be selected.
            </>
          ) : (
            <>
              No slots available on {formatDayLong(date)} for this doctor. Choose another date to
              continue. No appointment has been created and the patient&apos;s record is unchanged.
            </>
          )}
        </InfoNote>
      </div>

      <div className={s.formFooter}>
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <span className={s.spacer} />
        {checkInLabel ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (validate()) onCheckIn?.(buildPayload())
            }}
            disabled={busy || !slots.length}
            type="button"
          >
            {checkInLabel}
          </Button>
        ) : null}
        <Button variant="primary" size="sm" type="submit" disabled={busy || !slots.length}>
          {slots.length ? submitLabel : 'Choose another date'}
        </Button>
      </div>
    </form>
  )
}
