import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, ClipboardList, MessageSquareText } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  InfoNote,
  LoadingPane,
  StatusBadge,
  UnderlineTabs,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { getVisit } from '../../../services/visits'
import { getPatientHistory } from '../../../services/patients'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { formatAge, formatDate, formatDateShort, patientRef, visitRef } from '../../../utils/format'
import s from '../doctorPages.module.css'

export default function DoctorPatientHistoryPage() {
  const navigate = useNavigate()
  const { visitId } = useParams()
  const [tab, setTab] = useState('notes')
  const { data: visit, loading } = useAsync(() => getVisit(visitId), [visitId])
  const { data: history, loading: historyLoading } = useAsync(
    () => (visit?.patientId ? getPatientHistory(visit.patientId) : Promise.resolve(null)),
    [visit?.patientId],
  )
  useDocumentTitle('Patient history & notes')

  if (loading || historyLoading) return <LoadingPane label="Loading patient history…" />
  if (!visit || !history) return <p className="u-muted">Patient not found.</p>

  const patient = history.patient

  return (
    <>
      <PageHeader
        title="Patient history & notes"
        breadcrumb={[
          { label: 'Queue', to: '/doctor/queue' },
          { label: 'Patient history' },
        ]}
        backTo="/doctor/queue"
        backLabel="Back to consultation"
      />

      <Card>
        <h2 style={{ fontSize: 17 }}>{patient.fullName}</h2>
        <p className="u-small u-muted" style={{ marginTop: 2 }}>
          {patientRef(patient.id)} · {formatDate(patient.birthDate)} ({formatAge(patient.birthDate)}) ·{' '}
          {patient.phone}
        </p>
        <div style={{ marginTop: 10 }}>
          <InfoNote>Full patient history · Notes from all doctors are visible here.</InfoNote>
        </div>
      </Card>

      <UnderlineTabs
        tabs={[
          { id: 'notes', label: 'Clinical notes' },
          { id: 'visits', label: 'Visit history' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'notes' ? (
        <div className={s.stack}>
          {history.entries.length ? (
            history.entries.map((entry) => (
              <Card key={entry.visit.id}>
                <div className="u-between u-wrap" style={{ marginBottom: 8 }}>
                  <div>
                    <div className="u-row u-g6 u-wrap">
                      <span className="u-strong">{formatDateShort(entry.visit.date)}</span>
                      <span className="u-small u-muted">·</span>
                      <span className="u-strong">{entry.visit.doctorName}</span>
                      <span className="u-small u-muted">· {entry.visit.specialty}</span>
                    </div>
                    <div className="u-xs u-muted" style={{ marginTop: 2 }}>
                      {visitRef(entry.visit.id)} · {entry.visit.type} ·{' '}
                      <StatusBadge status={entry.visit.status} />
                    </div>
                  </div>
                  <Badge>{entry.notes.length} note{entry.notes.length > 1 ? 's' : ''}</Badge>
                </div>
                {entry.notes.map((note) => (
                  <p key={note.id} className="u-small" style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
                    {note.content}
                  </p>
                ))}
              </Card>
            ))
          ) : (
            <Card>
              <EmptyState
                icon={MessageSquareText}
                title="No clinical notes yet"
                description="Notes recorded during consultations will appear here."
              />
            </Card>
          )}
        </div>
      ) : (
        <Card padded={false}>
          <div className={s.toolbar} style={{ padding: '12px 14px' }}>
            <span className="u-small u-strong">All visits</span>
            <span className="u-xs u-muted">{history.visits.length} records</span>
          </div>
          <div className="u-scroll">
            <table className={s.mappingTable}>
              <thead>
                <tr>
                  <th>Date / visit ID</th>
                  <th>Type</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {history.visits.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="u-strong">{formatDateShort(item.date)}</div>
                      <div className="u-xs u-muted u-mono">{item.id}</div>
                    </td>
                    <td>{item.type}</td>
                    <td>
                      <div>{item.doctorName}</div>
                      <div className="u-xs u-muted">{item.specialty}</div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{item.billing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="u-row u-g8 u-wrap">
        <Button
          variant="secondary"
          size="sm"
          icon={ClipboardList}
          onClick={() => navigate('/doctor/queue')}
        >
          Back to consultation
        </Button>
        <span className={s.spacer} />
        <Button
          variant="primary"
          size="sm"
          icon={CalendarPlus}
          onClick={() => navigate(`/doctor/visits/new?patientId=${patient.id}`)}
        >
          Assign follow-up appointment
        </Button>
      </div>
    </>
  )
}
