import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FileWarning } from 'lucide-react'
import { Card, ConfirmDialog, LoadingPane } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { VisitForm } from '../../../components/visit/VisitForm'
import { listDoctors } from '../../../services/doctors'
import { getVisit, updateVisit } from '../../../services/visits'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { formatDate } from '../../../utils/format'

export default function ModifyVisitPage() {
  const navigate = useNavigate()
  const { visitId } = useParams()
  const { data: visit, loading } = useAsync(() => getVisit(visitId), [visitId])
  const { data: doctors } = useAsync(() => listDoctors(), [])
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  useDocumentTitle(visit ? `Modify ${visit.id}` : 'Modify visit')

  const requestCancel = () => {
    if (dirty) setDiscardOpen(true)
    else navigate(`/reception/visits/${visitId}`)
  }

  const submit = async (payload) => {
    setBusy(true)
    try {
      await updateVisit(visitId, payload)
      navigate(`/reception/visits/${visitId}`)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingPane label="Loading visit…" />
  if (!visit) return <p className="u-muted">Visit not found.</p>

  return (
    <>
      <PageHeader
        title="Modify visit"
        breadcrumb={[
          { label: 'Visits', to: '/reception/visits' },
          { label: visit.id, to: `/reception/visits/${visit.id}` },
          { label: 'Modify visit' },
        ]}
        backTo={`/reception/visits/${visit.id}`}
        backLabel="Back to visit details"
      />

      <Card title="Visit information">
        <div className="u-row u-g8 u-wrap u-small u-muted" style={{ marginBottom: 12 }}>
          <span className="u-strong" style={{ color: 'var(--text-2)' }}>
            {visit.patientName}
          </span>
          <span>· {visit.patientId}</span>
          <span>· Visit {visit.id}</span>
          <span>· Current: {formatDate(visit.date)} · {visit.timeLabel}</span>
        </div>
        <VisitForm
          patient={visit.patient}
          doctors={doctors ?? []}
          initial={visit}
          onSubmit={submit}
          onCancel={requestCancel}
          onDirty={() => setDirty(true)}
          busy={busy}
          submitLabel="Save visit changes"
          cancelLabel="Cancel"
        />
      </Card>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          navigate(`/reception/visits/${visitId}`)
        }}
        eyebrow="Unsaved changes"
        title="Discard changes?"
        description="The visit details you edited will not be saved. The existing visit stays unchanged."
        icon={FileWarning}
        tone="danger"
        summary={
          <>
            <strong>
              {visit.id} · {visit.patientName}
            </strong>
            <br />
            {visit.type} · {visit.timeLabel}
          </>
        }
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
      />
    </>
  )
}
