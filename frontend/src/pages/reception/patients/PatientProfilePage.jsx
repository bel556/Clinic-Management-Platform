import { useNavigate, useParams } from 'react-router-dom'
import { CalendarPlus, Pencil } from 'lucide-react'
import { Button, LoadingPane } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import {
  ClinicalBaselineCard,
  DemographicsCard,
  PatientHeaderCard,
  PatientVisitsCard,
} from '../../../components/patient/PatientCards'
import { getPatient } from '../../../services/patients'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import s from '../reception.module.css'

export default function PatientProfilePage() {
  const navigate = useNavigate()
  const { patientId } = useParams()
  const { data: patient, loading } = useAsync(() => getPatient(patientId), [patientId])
  useDocumentTitle(patient?.fullName ?? 'Patient profile')

  if (loading) return <LoadingPane label="Loading patient record…" />
  if (!patient) return <p className="u-muted">Patient not found.</p>

  return (
    <>
      <PageHeader
        title="Patient profile"
        description="Demographics, clinical baselines and visit history."
        backTo="/reception/patients"
        backLabel="Back to Patients Directory"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={Pencil}
              onClick={() => navigate(`/reception/patients/${patientId}/edit`)}
            >
              Edit details
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CalendarPlus}
              onClick={() => navigate(`/reception/visits/new?patientId=${patientId}`)}
            >
              New Appointment
            </Button>
          </>
        }
      />

      <PatientHeaderCard patient={patient} />

      <div className="u-grid2" style={{ alignItems: 'start' }}>
        <div className={s.stack}>
          <DemographicsCard patient={patient} />
          <ClinicalBaselineCard patient={patient} />
        </div>
        <PatientVisitsCard
          visits={[...patient.upcoming, ...patient.past].slice(0, 8)}
          onOpenVisit={(visit) => navigate(`/reception/visits/${visit.id}`)}
          action={
            <span className="u-xs u-muted">
              {patient.upcoming.length} upcoming · {patient.past.length} past
            </span>
          }
        />
      </div>
    </>
  )
}
