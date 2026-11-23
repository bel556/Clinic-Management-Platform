import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileWarning } from 'lucide-react'
import { Card, ConfirmDialog, LoadingPane } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { PatientForm } from '../../../components/patient/PatientForm'
import { getPatient, updatePatient } from '../../../services/patients'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'

export default function EditPatientPage() {
  useDocumentTitle('Edit patient')
  const navigate = useNavigate()
  const { patientId } = useParams()
  const { data: patient, loading } = useAsync(() => getPatient(patientId), [patientId])
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const requestCancel = () => {
    if (dirty) setDiscardOpen(true)
    else navigate(`/reception/patients/${patientId}`)
  }

  const submit = async (values) => {
    setBusy(true)
    try {
      await updatePatient(patientId, values)
      navigate(`/reception/patients/${patientId}`)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingPane label="Loading patient…" />
  if (!patient) return <p className="u-muted">Patient not found.</p>

  return (
    <>
      <PageHeader
        title="Edit patient information"
        breadcrumb={[
          { label: 'Patients', to: '/reception/patients' },
          { label: patient.fullName, to: `/reception/patients/${patientId}` },
          { label: 'Edit information' },
        ]}
        backTo={`/reception/patients/${patientId}`}
        backLabel="Back to patient profile"
      />

      <Card title="Personal information">
        <p className="u-small u-muted" style={{ marginBottom: 12 }}>
          Fields marked <span className="u-red">*</span> are required. Patient ID is generated when
          the record is created.
        </p>
        <PatientForm
          patient={patient}
          onSubmit={submit}
          onCancel={requestCancel}
          onDirty={() => setDirty(true)}
          busy={busy}
          submitLabel="Save changes"
          cancelLabel="Cancel"
        />
      </Card>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          navigate(`/reception/patients/${patientId}`)
        }}
        eyebrow="Unsaved changes"
        title="Discard changes?"
        description="Your edits have not been saved. The patient record will stay unchanged."
        icon={FileWarning}
        tone="danger"
        summary={
          <>
            <strong>{patient.fullName}</strong>
            <br />
            {patient.id} · updates not saved
          </>
        }
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
      />
    </>
  )
}
