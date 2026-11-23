import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ban, Building2, CheckCircle2, Clock3, Stethoscope } from 'lucide-react'
import {
  Badge,
  ConfirmDialog,
  Field,
  Textarea,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { QueueList, VitalsBaselineCard } from '../../../components/queue/QueueList'
import { ConsultationPanel } from '../../../components/queue/ConsultationPanel'
import {
  getConsultation,
  getDoctorQueue,
  markVisitDone,
  markVisitMissed,
  saveDraft as saveDraftNote,
} from '../../../services/queue'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { STAFF } from '../../../services/mockDb'
import s from '../doctorPages.module.css'
import q from '../../../components/queue/queue.module.css'

const DOCTOR_ID = 'D-01'

export default function DoctorQueuePage() {
  useDocumentTitle("Today's Queue")
  const navigate = useNavigate()
  const toast = useToast()
  const [selectedId, setSelectedId] = useState(null)
  const [doneOpen, setDoneOpen] = useState(false)
  const [missedOpen, setMissedOpen] = useState(false)
  const [missReason, setMissReason] = useState('')
  const [busy, setBusy] = useState(false)

  const { data, loading, reload } = useAsync(() => getDoctorQueue(DOCTOR_ID), [])
  const activeId = selectedId ?? data?.queue?.[0]?.id ?? null
  const { data: consultation, reload: reloadConsultation } = useAsync(
    () => (activeId ? getConsultation(activeId) : Promise.resolve(null)),
    [activeId],
  )

  const doctor = STAFF.doctor

  const afterAction = (message) => {
    toast.push(message)
    setDoneOpen(false)
    setMissedOpen(false)
    setMissReason('')
    setSelectedId(null)
    reload()
  }

  return (
    <>
      <PageHeader
        title="Today's Queue"
        description="Live waiting list for your clinic session."
        actions={
          <Badge tone="teal" dot>
            Session active · 00:41:20
          </Badge>
        }
      />

      <div className={q.doctorBanner}>
        <div className={q.doctorBannerMain}>
          <span className={q.doctorIcon}>
            <Stethoscope size={17} />
          </span>
          <div>
            <div className={q.doctorName}>
              {doctor.name}
              <span className="u-small u-muted">/ {doctor.department}</span>
            </div>
            <div className={q.doctorRole}>
              Cardiology · {doctor.accessLevel?.split(' / ')[0]}
            </div>
          </div>
        </div>
        <div className={q.doctorMeta}>
          <span className={q.metaItem}>
            <Building2 size={11} /> Exam Room 48 · Schedule Capacity: {data?.stats?.processed ?? 0} /{' '}
            {data?.stats?.capacity ?? 12} Patients Processed
          </span>
          <span className={q.metaItem}>
            <Clock3 size={11} /> {data?.stats?.waiting ?? 0} waiting
          </span>
        </div>
      </div>

      <div className={q.queueLayout}>
        <div className={s.stack}>
          <QueueList
            queue={data?.queue ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <VitalsBaselineCard vitals={consultation?.patient?.vitals ?? {}} />
        </div>

        <ConsultationPanel
          key={consultation?.visit?.id ?? 'empty'}
          consultation={consultation}
          busy={busy || loading}
          onViewHistory={() =>
            activeId && navigate(`/doctor/queue/${activeId}/history`)
          }
          onSaveDraft={async (notes) => {
            await saveDraftNote(activeId, notes)
            toast.push('Draft saved to the patient history.')
            reloadConsultation()
          }}
          onMarkDone={() => setDoneOpen(true)}
          onMarkMissed={() => setMissedOpen(true)}
        />
      </div>

      <ConfirmDialog
        open={doneOpen}
        onClose={() => setDoneOpen(false)}
        busy={busy}
        eyebrow="Complete consultation"
        title="Mark this visit as done?"
        description="Your consultation note will be saved to the patient's history and this patient will leave the active queue."
        icon={CheckCircle2}
        summary={
          consultation ? (
            <>
              <strong>
                {consultation.visit.queueLabel} · {consultation.visit.patientName} ·{' '}
                {consultation.visit.patientId}
              </strong>
              <br />
              Consultation · Today
              <br />
              Clinical note: saved for this visit
            </>
          ) : null
        }
        onConfirm={async () => {
          setBusy(true)
          try {
            await markVisitDone(activeId, consultation?.draft?.content ?? '')
            afterAction('Consultation completed and saved to patient history.')
          } finally {
            setBusy(false)
          }
        }}
        confirmLabel="Save & mark as done"
        cancelLabel="Continue consultation"
      >
        <p className="u-xs u-muted" style={{ marginTop: 10 }}>
          Payment stays {consultation?.visit?.billing ?? 'unchanged'}. Completing the consultation
          does not change billing.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={missedOpen}
        onClose={() => setMissedOpen(false)}
        busy={busy}
        eyebrow="Patient not available"
        title="Mark this visit as missed?"
        description="This patient will leave the active queue. The visit and any saved notes remain in the patient's history."
        icon={Ban}
        tone="danger"
        summary={
          consultation ? (
            <>
              <strong>
                {consultation.visit.queueLabel} · {consultation.visit.patientName} ·{' '}
                {consultation.visit.patientId}
              </strong>
              <br />
              {consultation.visit.type} · Today
            </>
          ) : null
        }
        confirmLabel="Mark as missed"
        cancelLabel="Keep in queue"
        confirmDisabled={!missReason.trim()}
        onConfirm={async () => {
          if (!missReason.trim()) return
          setBusy(true)
          try {
            await markVisitMissed(activeId, missReason)
            afterAction('Visit marked as missed and removed from the queue.')
          } finally {
            setBusy(false)
          }
        }}
      >
        <div style={{ marginTop: 10 }}>
          <Field label="Reason" required>
            <Textarea
              rows={2}
              value={missReason}
              onChange={(event) => setMissReason(event.target.value)}
              placeholder="Patient did not respond when called"
            />
          </Field>
          <p className="u-xs u-muted" style={{ marginTop: 8 }}>
            Payment status remains unchanged. Reception can review the visit if the patient returns.
          </p>
        </div>
      </ConfirmDialog>
    </>
  )
}
