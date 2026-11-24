import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, Info } from 'lucide-react'
import { Button, Field, InfoNote, Input, Select, Textarea } from '../common'
import { availableSlots, slotStart24 } from '../../services/appointments'
import { SPECIALTIES, TIME_SLOTS } from '../../utils/constants'
import { formatDayLong, patientRef, todayKey } from '../../utils/format'
import s from './visit.module.css'

function isGeneralist(spec) {
  if (!spec) return false
  const s = String(spec).trim().toLowerCase()
  return s === 'generalist' || s.includes('general')
}

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
  const [date, setDate] = useState(initial?.dayKey ?? todayKey())
  const [specialty, setSpecialty] = useState(initial?.specialty ?? '')
  const [doctorId, setDoctorId] = useState(initial?.doctorId ?? '')
  const [slot, setSlot] = useState(initial?.slot ?? '')
  const [reason, setReason] = useState(initial?.reason ?? '')
  const [slots, setSlots] = useState(TIME_SLOTS)
  const [errors, setErrors] = useState({})

  const isRegular = String(type ?? '').toLowerCase() === 'regular'

  const specialtyOptions = useMemo(
    () => [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))],
    [doctors],
  )

  const generalistSpecialty = useMemo(() => {
    return (
      specialtyOptions.find((s) => s.toLowerCase() === 'generalist') ||
      specialtyOptions.find(isGeneralist) ||
      SPECIALTIES.find(isGeneralist) ||
      'Generalist'
    )
  }, [specialtyOptions])

  const effectiveSpecialty = isRegular
    ? generalistSpecialty
    : specialty || 'ALL'

  const specialtyDoctors = useMemo(() => {
    if (isRegular) {
      return doctors.filter((doctor) => isGeneralist(doctor.specialty))
    }
    if (!effectiveSpecialty || effectiveSpecialty === 'ALL') {
      return doctors
    }
    if (isGeneralist(effectiveSpecialty)) {
      return doctors.filter((doctor) => isGeneralist(doctor.specialty))
    }
    return doctors.filter((doctor) => doctor.specialty === effectiveSpecialty)
  }, [doctors, isRegular, effectiveSpecialty])

  const bookingDoctors = useMemo(
    () => specialtyDoctors.filter((doctor) => doctor.present || doctor.id === doctorId),
    [specialtyDoctors, doctorId],
  )

  const effectiveDoctorId = useMemo(() => {
    if (doctorId && bookingDoctors.some((d) => String(d.id) === String(doctorId))) {
      return doctorId
    }
    return bookingDoctors[0]?.id || ''
  }, [doctorId, bookingDoctors])

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

  const handleTypeChange = (nextType) => {
    setType(nextType)
    onDirty?.()
    const nextIsRegular = String(nextType).toLowerCase() === 'regular'
    if (nextIsRegular) {
      setSpecialty(generalistSpecialty)
      setSlot('')
      const cur = doctors.find((d) => String(d.id) === String(doctorId))
      if (!cur || !isGeneralist(cur.specialty)) {
        setDoctorId('')
      }
    } else {
      if (isRegular) {
        setSpecialty('ALL')
        setDoctorId('')
        setSlot('')
      }
    }
  }

  const handleSpecialty = (value) => {
    setSpecialty(value)
    setDoctorId('')
    setSlot('')
    onDirty?.()
  }

  const selectedDoctor = useMemo(
    () => doctors.find((d) => String(d.id) === String(effectiveDoctorId)),
    [doctors, effectiveDoctorId],
  )

  const buildPayload = () => ({
    patientId: patient?.id,
    doctorId: effectiveDoctorId,
    specialty: isRegular
      ? (selectedDoctor?.specialty || generalistSpecialty)
      : effectiveSpecialty === 'ALL'
      ? (selectedDoctor?.specialty || '')
      : effectiveSpecialty,
    date,
    slot,
    time: slot ? slotStart24(slot) : '',
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
          <span className={s.patientBannerId}>{patientRef(patient.id)}</span>
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
                onClick={() => handleTypeChange(option)}
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
            value={isRegular ? generalistSpecialty : effectiveSpecialty}
            onChange={(event) => handleSpecialty(event.target.value)}
            disabled={isRegular}
          >
            {isRegular ? (
              <option value={generalistSpecialty}>
                {generalistSpecialty.toLowerCase() === 'general practice' ? 'Generalist' : generalistSpecialty}
              </option>
            ) : (
              <>
                <option value="ALL">All specialties</option>
                {[...new Set([...(specialtyOptions.length ? specialtyOptions : SPECIALTIES)])].map((option) => (
                  <option key={option} value={option}>
                    {option.toLowerCase() === 'general practice' ? 'Generalist' : option}
                  </option>
                ))}
              </>
            )}
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
            {bookingDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}{!isRegular && (effectiveSpecialty === 'ALL' || !effectiveSpecialty) ? ` (${doctor.specialty})` : ''} · {doctor.present ? 'Present' : 'Absent'}
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
              {isRegular
                ? 'Generalist'
                : effectiveSpecialty === 'ALL'
                ? selectedDoctor?.specialty || 'All specialties'
                : effectiveSpecialty}{' '}
              · {slots.length} available {slots.length === 1 ? 'slot' : 'slots'}:{' '}
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
            disabled={busy || !slots.length || date !== todayKey()}
            title={
              date !== todayKey()
                ? 'Check-in is only available for visits scheduled today'
                : undefined
            }
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
