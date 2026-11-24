import { useState } from 'react'
import { Button, Field, Input, ReadOnly, Select, Textarea } from '../common'
import { patientRef } from '../../utils/format'
import s from './patient.module.css'

const GENDERS = ['Female', 'Male']

const emptyPatient = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  emergencyContact: '',
  additionalInfo: '',
  bloodType: '',
  allergies: '',
  conditions: '',
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function toFormValues(patient) {
  if (!patient) return emptyPatient
  return {
    firstName: patient.firstName ?? '',
    lastName: patient.lastName ?? '',
    birthDate: patient.birthDate ?? '',
    gender: patient.gender ?? '',
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    emergencyContact: patient.emergencyContact ?? '',
    additionalInfo: patient.additionalInfo === 'No additional information' ? '' : patient.additionalInfo ?? '',
    bloodType: patient.bloodType ?? '',
    allergies: (patient.allergies ?? []).join('\n'),
    conditions: (patient.conditions ?? []).join('\n'),
  }
}

export function PatientForm({
  patient,
  onSubmit,
  onCancel,
  submitLabel = 'Save & create visit',
  cancelLabel = 'Cancel',
  busy = false,
  onDirty,
}) {
  const [values, setValues] = useState(() => toFormValues(patient))
  const [errors, setErrors] = useState({})

  const set = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    onDirty?.()
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!values.firstName.trim()) nextErrors.firstName = 'First name is required'
    if (!values.lastName.trim()) nextErrors.lastName = 'Last name is required'
    if (!values.birthDate) nextErrors.birthDate = 'Date of birth is required'
    if (!values.gender) nextErrors.gender = 'Select a gender'
    if (!values.phone.trim()) nextErrors.phone = 'Phone number is required'
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    onSubmit?.(values)
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className={s.formGrid}>
        {patient ? (
          <Field label="Patient ID" className={s.formGridFull}>
            <ReadOnly>
              {patientRef(patient.id)} — read-only, assigned when the record was created
            </ReadOnly>
          </Field>
        ) : null}

        <Field label="First name" required error={errors.firstName} htmlFor="firstName">
          <Input
            id="firstName"
            value={values.firstName}
            onChange={set('firstName')}
            placeholder="Nadia"
            invalid={Boolean(errors.firstName)}
            autoComplete="off"
          />
        </Field>

        <Field label="Last name" required error={errors.lastName} htmlFor="lastName">
          <Input
            id="lastName"
            value={values.lastName}
            onChange={set('lastName')}
            placeholder="Bensaid"
            invalid={Boolean(errors.lastName)}
            autoComplete="off"
          />
        </Field>

        <Field label="Date of birth" required error={errors.birthDate} htmlFor="birthDate">
          <Input
            id="birthDate"
            type="date"
            value={values.birthDate}
            onChange={set('birthDate')}
            invalid={Boolean(errors.birthDate)}
          />
        </Field>

        <Field label="Gender" required error={errors.gender} htmlFor="gender">
          <Select
            id="gender"
            value={values.gender}
            onChange={set('gender')}
            invalid={Boolean(errors.gender)}
          >
            <option value="">Select gender</option>
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Phone number" required error={errors.phone} htmlFor="phone">
          <Input
            id="phone"
            value={values.phone}
            onChange={set('phone')}
            placeholder="+1 (555) 000-0000"
            invalid={Boolean(errors.phone)}
            autoComplete="off"
          />
        </Field>

        <Field label="Email (optional)" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={set('email')}
            placeholder="patient@example.com"
            autoComplete="off"
          />
        </Field>

        <Field label="Emergency contact" htmlFor="emergency" className={s.formGridFull}>
          <Input
            id="emergency"
            value={values.emergencyContact}
            onChange={set('emergencyContact')}
            placeholder="Name · relationship · phone number"
          />
        </Field>

        <Field label="Blood type" htmlFor="bloodType">
          <Select id="bloodType" value={values.bloodType} onChange={set('bloodType')}>
            <option value="">Not recorded</option>
            {BLOOD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Additional information (optional)" htmlFor="additional">
          <Input
            id="additional"
            value={values.additionalInfo}
            onChange={set('additionalInfo')}
            placeholder="Accessibility needs, notes…"
          />
        </Field>

        <Field
          label="Known allergies (one per line)"
          htmlFor="allergies"
          className={s.formGridFull}
        >
          <Textarea
            id="allergies"
            rows={2}
            value={values.allergies}
            onChange={set('allergies')}
            placeholder="Penicillin (severe rash)"
          />
        </Field>

        <Field
          label="Chronic conditions (one per line)"
          htmlFor="conditions"
          className={s.formGridFull}
        >
          <Textarea
            id="conditions"
            rows={2}
            value={values.conditions}
            onChange={set('conditions')}
            placeholder="Essential hypertension"
          />
        </Field>
      </div>

      <div className={s.formFooter}>
        <span className={s.spacer} />
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant="primary" size="sm" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
