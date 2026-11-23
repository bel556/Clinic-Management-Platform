import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, SearchX } from 'lucide-react'
import {
  Card,
  EmptyState,
  InfoNote,
  LoadingPane,
  Pagination,
  SearchInput,
  StatusBadge,
  Tabs,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { listDoctorCalendar } from '../../../services/appointments'
import { useAsync, useDocumentTitle, useDebouncedValue } from '../../../utils/hooks'
import { formatDateShort } from '../../../utils/format'
import s from '../doctorPages.module.css'

const DOCTOR_ID = 'D-01'
const PAGE_SIZE = 5

export default function VisitHistoryPage() {
  useDocumentTitle('Visit history')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(query, 160)
  const { data, loading } = useAsync(() => listDoctorCalendar(DOCTOR_ID), [])

  const rows = useMemo(() => {
    const needle = debounced.trim().toLowerCase()
    return (data?.history ?? []).filter((visit) => {
      if (!needle) return true
      return (
        visit.patientName.toLowerCase().includes(needle) ||
        visit.patientId.toLowerCase().includes(needle) ||
        visit.id.toLowerCase().includes(needle)
      )
    })
  }, [data, debounced])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  return (
    <>
      <PageHeader
        title="Visit history"
        description="Past visits, completed consultations and missed appointments."
        breadcrumb={[
          { label: 'My Visits & Calendar', to: '/doctor/visits' },
          { label: 'History' },
        ]}
        backTo="/doctor/visits"
        backLabel="Back to calendar"
      />

      <Tabs
        tabs={[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'history', label: 'History' },
        ]}
        value="history"
        onChange={(value) => {
          if (value === 'upcoming') navigate('/doctor/visits')
        }}
      />

      <Card padded={false}>
        <div className="u-between u-wrap" style={{ padding: '12px 14px' }}>
          <span className="u-small u-strong">Past visits</span>
          <div style={{ width: 260 }}>
            <SearchInput
              value={query}
              onChange={(value) => {
                setQuery(value)
                setPage(1)
              }}
              placeholder="Search patient name, patient ID or visit ID"
            />
          </div>
        </div>

        {loading ? (
          <LoadingPane label="Loading visit history…" />
        ) : visible.length ? (
          <div className="u-scroll">
            <table className={s.mappingTable}>
              <thead>
                <tr>
                  <th>Date / visit ID</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <div className="u-strong">{formatDateShort(visit.date)}</div>
                      <div className="u-xs u-muted u-mono">{visit.id}</div>
                    </td>
                    <td>
                      <div className="u-strong" style={{ fontSize: 11.5 }}>
                        {visit.patientName}
                      </div>
                      <div className="u-xs u-muted u-mono">{visit.patientId}</div>
                    </td>
                    <td>{visit.type}</td>
                    <td>
                      <StatusBadge status={visit.status} />
                    </td>
                    <td>{visit.billing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={SearchX}
            title={debounced ? 'No matching visits' : 'No past visits yet'}
            description={
              debounced
                ? 'Check the spelling or search by patient ID instead.'
                : 'Completed consultations will appear here.'
            }
          />
        )}

        <div className="u-between" style={{ padding: '9px 14px', borderTop: '1px solid var(--border-soft)' }}>
          <span className="u-xs u-muted">
            Showing {visible.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}–
            {(safePage - 1) * PAGE_SIZE + visible.length} of {rows.length} past visits
          </span>
          <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
        </div>
      </Card>

      <InfoNote icon={History}>
        Open a visit to read its clinical notes. Past visits cannot be cancelled or rescheduled.
      </InfoNote>
    </>
  )
}
