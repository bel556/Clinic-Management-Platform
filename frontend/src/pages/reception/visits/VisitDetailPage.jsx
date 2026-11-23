import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, ChevronRight, Pencil, Printer, Ticket } from 'lucide-react'
import {
  Button,
  Card,
  ConfirmDialog,
  InfoNote,
  LoadingPane,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { DetailRow, TicketPreview } from '../../../components/visit/VisitSummary'
import { getVisit, updateVisit } from '../../../services/visits'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { formatDate, formatTime } from '../../../utils/format'
import s from '../reception.module.css'

export default function VisitDetailPage() {
  const navigate = useNavigate()
  const { visitId } = useParams()
  const { data: visit, loading, reload } = useAsync(() => getVisit(visitId), [visitId])
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  useDocumentTitle(visit ? `Visit ${visit.id}` : 'Visit details')

  if (loading) return <LoadingPane label="Loading visit…" />
  if (!visit) return <p className="u-muted">Visit not found.</p>

  const confirmCancel = async () => {
    setBusy(true)
    try {
      await updateVisit(visit.id, { status: 'Cancelled' })
      setCancelOpen(false)
      reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Visit details"
        breadcrumb={[
          { label: 'Visits', to: '/reception/visits' },
          { label: visit.id },
        ]}
        backTo="/reception/visits"
        backLabel="Back to Today's Visits"
      />

      <div className={s.stack}>
        <Card>
          <div className="u-between u-wrap" style={{ marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 17 }}>{visit.patientName}</h2>
              <p className="u-small u-muted">
                {visit.patientId} · {visit.patientPhone}
              </p>
              <div className="u-row u-g6" style={{ marginTop: 7 }}>
                <span className="u-small u-muted">Visit status</span>
                <span className="u-small u-semibold">{visit.status}</span>
                <span className="u-small u-muted">· Billing</span>
                <span className="u-small u-semibold">{visit.billing}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              trailingIcon={ChevronRight}
              onClick={() => navigate(`/reception/patients/${visit.patientId}`)}
            >
              Open patient profile
            </Button>
          </div>

          <div className="u-grid2">
            <DetailRow label="Visit ID">{visit.id}</DetailRow>
            <DetailRow label="Visit type">{visit.type}</DetailRow>
            <DetailRow label="Date and time">
              {formatDate(visit.date)} · {formatTime(visit.date)}
            </DetailRow>
            <DetailRow label="Attending doctor">
              {visit.doctorName} · {visit.specialty}
            </DetailRow>
            <DetailRow label="Reason for visit">
              {visit.reason || 'No reason recorded'}
            </DetailRow>
            <DetailRow label="Queue number">
              {visit.queue ? visit.queueLabel : 'Assigned at check-in'}
            </DetailRow>
          </div>

          <div style={{ marginTop: 14 }}>
            <InfoNote>
              Queue number is assigned at check-in. Tickets are only available for today&apos;s
              visits. Only Finance can change payment status.
            </InfoNote>
          </div>

          <div className="u-row u-g8 u-wrap" style={{ marginTop: 14 }}>
            <Button
              variant="primary"
              size="sm"
              icon={Pencil}
              onClick={() => navigate(`/reception/visits/${visit.id}/edit`)}
            >
              Modify visit
            </Button>
            <Button
              variant="dangerGhost"
              size="sm"
              icon={Ban}
              onClick={() => setCancelOpen(true)}
              disabled={visit.status === 'Cancelled'}
            >
              Cancel visit
            </Button>
            {visit.status === 'Present' ? (
              <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print ticket
              </Button>
            ) : null}
          </div>
        </Card>

        {visit.status === 'Present' ? (
          <Card title="Queue ticket" icon={Ticket} action={<span className="u-xs u-muted">Preview</span>}>
            <div className="u-center">
              <TicketPreview visit={visit} />
            </div>
          </Card>
        ) : null}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        busy={busy}
        eyebrow="Cancel visit"
        title="Cancel this visit?"
        description="The visit will be marked as cancelled and removed from the waiting queue. The patient record and visit history are kept."
        icon={Ban}
        tone="danger"
        summary={
          <>
            <strong>
              {visit.id} · {visit.patientName}
            </strong>
            <br />
            {visit.type} · {formatDate(visit.date)} · {visit.timeLabel}
            <br />
            {visit.doctorName} · {visit.specialty}
          </>
        }
        confirmLabel="Cancel visit"
        cancelLabel="Keep visit"
      />
    </>
  )
}
