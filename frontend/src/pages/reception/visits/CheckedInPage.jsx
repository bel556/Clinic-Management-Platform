import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button, Card, LoadingPane } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import {
  SuccessBanner,
  TicketPreview,
  VisitSummary,
} from '../../../components/visit/VisitSummary'
import { getVisit } from '../../../services/visits'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { formatDate, visitRef } from '../../../utils/format'
import s from '../reception.module.css'
import v from '../../../components/visit/visit.module.css'

export default function CheckedInPage() {
  const navigate = useNavigate()
  const { visitId } = useParams()
  const { data: visit, loading } = useAsync(() => getVisit(visitId), [visitId])
  useDocumentTitle('Patient checked in')

  if (loading) return <LoadingPane label="Loading visit…" />
  if (!visit) return <p className="u-muted">Visit not found.</p>

  return (
    <>
      <PageHeader
        title="Patient checked in"
        breadcrumb={[
          { label: 'Visits', to: '/reception/visits' },
          { label: `Visit ${visitRef(visit.id)}` },
        ]}
      />

      <SuccessBanner title="Patient checked in">
        <p className="u-small u-muted" style={{ marginTop: 4 }}>
          Check-in complete · {visit.patientName} is now <strong>Present</strong> and has been added
          to {visit.doctorName}&apos;s queue.
        </p>
      </SuccessBanner>

      <div className={v.checkedInWrap}>
        <div className={s.stack}>
          <VisitSummary
            visit={visit}
            checkedInNote={`Checked in today, ${formatDate(visit.date)}, at ${visit.timeLabel}. Queue position follows arrival order.`}
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ArrowLeft}
                  onClick={() => navigate('/reception/visits')}
                >
                  Back to visits
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print ticket
                </Button>
              </>
            }
          />
        </div>

        <Card bodyClassName={s.pad}>
          <div className={v.ticketPanel}>
            <div className={v.ticketPanelHead}>
              <span>Queue ticket</span>
              <span className="u-xs u-muted">Q-NUMBER</span>
            </div>
            <TicketPreview visit={visit} />
            <p className="u-xs u-muted">
              Please watch the waiting room display for your queue number.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
