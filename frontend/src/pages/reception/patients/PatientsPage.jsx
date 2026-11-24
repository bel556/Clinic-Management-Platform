import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, Plus, SearchX, Sparkles, Users } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  ErrorPane,
  InfoNote,
  LoadingPane,
  SearchInput,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { PatientTable } from '../../../components/patient/PatientTable'
import { listPatientDirectory, searchPatients } from '../../../services/patients'
import { useAsync, useDebouncedValue, useDocumentTitle } from '../../../utils/hooks'
import s from '../reception.module.css'

export default function PatientsPage() {
  useDocumentTitle('Patients')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debounced = useDebouncedValue(query, 180)
  const { data, loading, error, reload } = useAsync(() => listPatientDirectory(), [])
  const { data: searchResults, loading: searchLoading } = useAsync(
    () => (debounced.trim() ? searchPatients(debounced) : Promise.resolve([])),
    [debounced],
  )

  const results = useMemo(() => searchResults ?? [], [searchResults])

  const openPatient = (patient) => navigate(`/reception/patients/${patient.id}`)
  const addVisit = (patient) => navigate(`/reception/visits/new?patientId=${patient.id}`)

  const searching = debounced.trim().length > 0

  return (
    <>
      <PageHeader
        title="Patients"
        description="Search by patient ID, name, or phone number."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/reception/patients/new')}
          >
            New Patient
          </Button>
        }
      />

      <div className={s.searchCard}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by patient ID, name, or phone…"
        />
      </div>

      {loading || (searching && searchLoading) ? <LoadingPane label="Loading patients…" /> : null}

      {!loading && error ? <ErrorPane error={error} onRetry={reload} /> : null}

      {!loading && searching && !results.length ? (
        <div className={s.stack}>
          <Card padded={false}>
            <EmptyState
              icon={SearchX}
              title={`No patients found`}
              description={`No patient matches “${debounced}”. Check the spelling, search by phone number, or create a new patient record.`}
              actions={
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/reception/patients/new')}
                  >
                    New patient
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                    Clear search
                  </Button>
                </>
              }
            />
          </Card>
          <InfoNote>
            Before creating a record, confirm the patient&apos;s phone number to avoid duplicate
            profiles.
          </InfoNote>
        </div>
      ) : null}

      {!loading && searching && results.length ? (
        <div className={s.cardShell}>
          <div className={s.sectionLine}>
            <span className={s.sectionLineIcon}>
              <Users size={13} />
            </span>
            Search results
            <span className={s.sectionLineMeta}>{results.length} matches</span>
          </div>
          <PatientTable rows={results} onOpen={openPatient} onAddVisit={addVisit} bare />
        </div>
      ) : null}

      {!loading && !searching && data ? (
        <div className={s.stack}>
          <div className={s.cardShell}>
            <div className={s.sectionLine}>
              <span className={s.sectionLineIcon}>
                <Sparkles size={13} />
              </span>
              Latest registrations
              <span className={s.sectionLineMeta}>Newest records first</span>
            </div>
            <PatientTable rows={data.recent} onOpen={openPatient} onAddVisit={addVisit} bare />
          </div>

          <div className={s.cardShell}>
            <div className={s.sectionLine}>
              <span className={s.sectionLineIcon}>
                <History size={13} />
              </span>
              Recently searched
              <span className={s.sectionLineMeta}>Recalled today</span>
            </div>
            <PatientTable rows={data.searched} onOpen={openPatient} onAddVisit={addVisit} bare />
          </div>
        </div>
      ) : null}
    </>
  )
}
