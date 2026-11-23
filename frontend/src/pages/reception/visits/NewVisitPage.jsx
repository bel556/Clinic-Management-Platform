import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FileWarning, Search } from 'lucide-react'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingPane,
  SearchInput,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { VisitForm } from '../../../components/visit/VisitForm'
import { listDoctors } from '../../../services/doctors'
import { getPatient, searchPatients } from '../../../services/patients'
import { createVisit } from '../../../services/visits'
import { useAsync, useDebouncedValue, useDocumentTitle } from '../../../utils/hooks'
import s from '../reception.module.css'

export default function NewVisitPage() {
  useDocumentTitle('Add patient visit')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const patientId = params.get('patientId')
  const [dirty, setDirty] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 180)

  const { data: patient, loading: patientLoading } = useAsync(
    () => (patientId ? getPatient(patientId) : Promise.resolve(null)),
    [patientId],
  )
  const { data: doctors } = useAsync(() => listDoctors(), [])
  const { data: matches } = useAsync(
    () => (debounced.trim() ? searchPatients(debounced) : Promise.resolve([])),
    [debounced],
  )

  const requestCancel = () => {
    if (dirty) setDiscardOpen(true)
    else navigate('/reception/visits')
  }

  const goToVisit = async (payload, checkIn) => {
    setBusy(true)
    try {
      const visit = await createVisit({ ...payload, status: checkIn ? 'Present' : 'Upcoming' })
      navigate(checkIn ? `/reception/visits/${visit.id}/checked-in` : `/reception/visits/${visit.id}`)
    } finally {
      setBusy(false)
    }
  }

  if (!patientId) {
    return (
      <>
        <PageHeader
          title="Add patient visit"
          description="Start by selecting the patient this visit belongs to."
          backTo="/reception/visits"
          backLabel="Back to Today's Visits"
          breadcrumb={[{ label: 'Visits', to: '/reception/visits' }, { label: 'New visit' }]}
        />
        <Card title="Select patient">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search patient name, ID, or phone…"
            autoFocus
          />
          <div style={{ marginTop: 12 }} className="u-col u-g6">
            {matches?.length ? (
              matches.map((match) => (
                <button
                  key={match.id}
                  type="button"
                  className="u-between"
                  style={{
                    padding: '9px 11px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: '#fff',
                    textAlign: 'left',
                  }}
                  onClick={() => setParams({ patientId: match.id })}
                >
                  <span>
                    <span className="u-strong">{match.fullName}</span>{' '}
                    <span className="u-mono u-small u-muted">{match.id}</span>
                    <br />
                    <span className="u-small u-muted">{match.phone}</span>
                  </span>
                  <span className="u-row u-g6 u-teal u-small">
                    <Search size={12} /> Select
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                icon={Search}
                title={debounced ? 'No matching patient' : 'Search for the patient'}
                description={
                  debounced
                    ? 'Create the patient record first, then return to book the visit.'
                    : 'Type a name, patient ID, or phone number to find the record.'
                }
                actions={
                  debounced ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/reception/patients/new')}
                    >
                      New patient
                    </Button>
                  ) : null
                }
              />
            )}
          </div>
        </Card>
        <div className={s.stackSm}>
          <div className={s.toolbar}>
            <Button variant="secondary" size="sm" onClick={() => navigate('/reception/visits')}>
              Cancel
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (patientLoading) return <LoadingPane label="Preparing visit form…" />
  if (!patient) return <p className="u-muted">Patient not found.</p>

  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 2 · Encounter registration"
        title="Add patient visit"
        breadcrumb={[
          { label: 'Patients', to: '/reception/patients' },
          { label: patient.fullName, to: `/reception/patients/${patient.id}` },
          { label: 'Add visit' },
        ]}
        backTo={`/reception/patients/${patient.id}`}
        backLabel="Back to patient profile"
      />

      <Card title="Visit information">
        <VisitForm
          patient={patient}
          doctors={doctors ?? []}
          onSubmit={(payload) => goToVisit(payload, false)}
          onCheckIn={(payload) => goToVisit(payload, true)}
          onCancel={requestCancel}
          onDirty={() => setDirty(true)}
          busy={busy}
          submitLabel="Create appointment"
          checkInLabel="Save & check in visit"
        />
      </Card>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          navigate('/reception/visits')
        }}
        eyebrow="Unsaved visit"
        title="Discard this visit?"
        description="The visit details you entered will not be saved. The patient's existing record will stay unchanged."
        icon={FileWarning}
        tone="danger"
        summary={
          <>
            <strong>
              {patient.fullName} · {patient.id}
            </strong>
            <br />
            New visit · {patient.primaryPhysician ?? 'Unassigned doctor'}
          </>
        }
        confirmLabel="Discard visit"
        cancelLabel="Keep editing"
      />
    </>
  )
}
