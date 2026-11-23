import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileWarning } from 'lucide-react'
import { Card, ConfirmDialog } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { PatientForm } from '../../../components/patient/PatientForm'
import { createPatient } from '../../../services/patients'

export default function NewPatientPage() {
  const navigate = useNavigate()
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const requestCancel = () => {
    if (dirty) setDiscardOpen(true)
    else navigate('/reception/patients')
  }

  const submit = async (values) => {
    setBusy(true)
    try {
      const patient = await createPatient(values)
      navigate(`/reception/visits/new?patientId=${patient.id}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="New patient"
        breadcrumb={[
          { label: 'Patients', to: '/reception/patients' },
          { label: 'Register a new patient' },
        ]}
        backTo="/reception/patients"
        backLabel="Back to Patients"
      />

      <Card title="Personal information">
        <p className="u-small u-muted" style={{ marginBottom: 12 }}>
          Fields marked <span className="u-red">*</span> are required. Patient ID is generated when
          you save.
        </p>
        <PatientForm
          onSubmit={submit}
          onCancel={requestCancel}
          onDirty={() => setDirty(true)}
          busy={busy}
          submitLabel="Save & create visit"
        />
      </Card>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          navigate('/reception/patients')
        }}
        eyebrow="Unsaved patient"
        title="Discard this patient?"
        description="Your unsaved patient information will be lost. No patient record or visit has been created."
        icon={FileWarning}
        tone="danger"
        summary={
          <>
            <strong>New patient record</strong>
            <br />
            Personal information has not been saved.
          </>
        }
        confirmLabel="Discard patient"
        cancelLabel="Keep editing"
      />
    </>
  )
}
