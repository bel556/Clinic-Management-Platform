import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CalendarPlus,
  ClipboardList,
  Download,
  Printer,
  RefreshCw,
  Ticket,
  Trash2,
  UserCheck,
} from 'lucide-react'
import {
  Button,
  Card,
  ConfirmDialog,
  ErrorPane,
  EmptyState,
  IconButton,
  InfoNote,
  Input,
  LoadingPane,
  Modal,
  Pagination,
  SearchInput,
  Tabs,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { VisitTable } from '../../../components/visit/VisitTable'
import { TicketPreview } from '../../../components/visit/VisitSummary'
import { getVisit, checkInVisit, deleteVisit, listVisitBoard } from '../../../services/visits'
import { useSession } from '../../../services/session'
import { listDoctors } from '../../../services/doctors'
import { useAsync, useDocumentTitle, useDebouncedValue } from '../../../utils/hooks'
import { formatDayLong, patientRef, todayKey, visitRef } from '../../../utils/format'
import s from '../reception.module.css'

export default function VisitsPage() {
  useDocumentTitle('Visits')
  const { users } = useSession()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const day = params.get('day') || todayKey()
  const setDay = (next) => {
    const nextParams = new URLSearchParams(params)
    nextParams.set('day', next)
    setParams(nextParams, { replace: true })
  }
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [doctorId, setDoctorId] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [printVisit, setPrintVisit] = useState(null)
  const [checkInTarget, setCheckInTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const debouncedQuery = useDebouncedValue(query, 180)

  const { data, loading, error, reload } = useAsync(
    () =>
      listVisitBoard({
        status,
        query: debouncedQuery,
        doctorId,
        page,
        pageSize: 8,
        day,
      }),
    [status, debouncedQuery, doctorId, page, day],
  )
  const { data: doctors } = useAsync(() => listDoctors(), [])

  const counts = data?.counts ?? { all: 0, Upcoming: 0, Present: 0, Missed: 0 }
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'Upcoming', label: 'Upcoming', count: counts.Upcoming },
    { id: 'Present', label: 'Present', count: counts.Present },
    { id: 'Missed', label: 'Missed', count: counts.Missed },
  ]

  const rows = useMemo(() => data?.rows ?? [], [data])
  const panelVisit = useMemo(() => {
    if (!rows.length) return null
    return rows.find((visit) => visit.id === selectedId) ?? rows.find((visit) => visit.status === 'Present') ?? null
  }, [rows, selectedId])

  const confirmCheckIn = async () => {
    if (!checkInTarget) return
    setBusy(true)
    try {
      const visit = await checkInVisit(checkInTarget.id)
      setCheckInTarget(null)
      navigate(`/reception/visits/${visit.id}/checked-in`)
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await deleteVisit(deleteTarget.id)
      setDeleteTarget(null)
      reload()
    } finally {
      setBusy(false)
    }
  }

  const openPrintFor = async (visit) => {
    const full = await getVisit(visit.id)
    setPrintVisit(full)
  }

  const exportLog = () => {
    const cell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const header = ['Visit', 'Patient ID', 'Patient', 'Doctor', 'Date', 'Type', 'Status', 'Billing']
    const lines = rows.map((visit) =>
      [
        visitRef(visit.id),
        patientRef(visit.patientId),
        visit.patientName,
        visit.doctorName,
        visit.date,
        visit.type,
        visit.status,
        visit.billing,
      ]
        .map(cell)
        .join(','),
    )
    const blob = new Blob([[header.map(cell).join(','), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `visits-${todayKey()}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <PageHeader
        title="Visits"
        description={`${formatDayLong(day)} · Manage front desk check-in, patient queues, and appointment schedules.`}
        actions={
          <>
            {status === 'Missed' ? (
              <Button variant="secondary" size="sm" icon={Download} onClick={exportLog}>
                Export Log
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              icon={CalendarPlus}
              onClick={() => navigate(`/reception/visits/new?date=${day}`)}
            >
              Add Visit
            </Button>
          </>
        }
      />

      <div className={s.boardLayout}>
        <div className={s.boardMain}>
          <div className={s.boardToolbar}>
            <Tabs
              tabs={tabs}
              value={status}
              onChange={(next) => {
                setStatus(next)
                setPage(1)
              }}
            />
            <div className="u-grow" />
            <div className="u-row u-g8">
              <span className="u-xs u-muted">Day</span>
              <Input
                type="date"
                value={day}
                onChange={(event) => {
                  setDay(event.target.value || todayKey())
                  setPage(1)
                  setSelectedId(null)
                }}
                style={{ width: 160 }}
              />
              {day !== todayKey() ? (
                <Button variant="secondary" size="sm" onClick={() => setDay(todayKey())}>
                  Today
                </Button>
              ) : null}
            </div>
          </div>

          <div className={s.boardToolbar}>
            <div className="u-grow" style={{ minWidth: 200 }}>
              <SearchInput
                value={query}
                onChange={(value) => {
                  setQuery(value)
                  setPage(1)
                }}
                placeholder="Search patient name or ID…"
              />
            </div>
            <select
              className={s.filterSelect}
              value={doctorId}
              onChange={(event) => {
                setDoctorId(event.target.value)
                setPage(1)
              }}
              aria-label="Filter by doctor"
            >
              <option value="all">All Attending Doctors</option>
              {(doctors ?? []).map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            <IconButton icon={RefreshCw} label="Refresh visits" boxed onClick={reload} />
          </div>

          {status === 'Missed' ? (
            <InfoNote tone="danger">
              <strong>Missed Visit Policy Notice</strong>
              <br />
              Missed visits represent scheduled appointments where the patient did not check in
              during their allocated slot. Front desk can reschedule or re-open the visit if the
              patient arrives late.
            </InfoNote>
          ) : null}

          {loading ? (
            <LoadingPane label="Loading today's visits…" />
          ) : error ? (
            <ErrorPane error={error} onRetry={reload} />
          ) : (
            <VisitTable
              rows={rows}
              onOpen={(visit) => {
                if (visit.status === 'Present') setSelectedId(visit.id)
                else navigate(`/reception/visits/${visit.id}`)
              }}
              onCheckIn={day === todayKey() ? setCheckInTarget : undefined}
              onLateCheckIn={day === todayKey() ? setCheckInTarget : undefined}
              onPrint={day === todayKey() ? openPrintFor : undefined}
              onEdit={(visit) => navigate(`/reception/visits/${visit.id}/edit`)}
              onDelete={setDeleteTarget}
              onReschedule={(visit) => navigate(`/reception/visits/${visit.id}/edit`)}
              empty={
                <EmptyState
                  icon={ClipboardList}
                  title="No visits in this view"
                  description="Try another status tab or clear the search filters."
                />
              }
            />
          )}

          <div className={s.boardToolbar}>
            <span className="u-xs u-muted">
              Showing {rows.length} of {data?.total ?? 0} visits · Active Front Desk:{' '}
              {users.receptionist.name}
            </span>
            <span className="u-right">
              <Pagination page={data?.page ?? 1} pageCount={data?.pageCount ?? 1} onChange={setPage} />
            </span>
          </div>
        </div>

        <div className="u-col u-g12">
          <Card
            title="Ticket"
            icon={Ticket}
            action={<span className="u-xs u-muted">Front Desk Printer</span>}
            bodyClassName={s.pad}
          >
            {day === todayKey() && panelVisit ? (
              <div className="u-col u-g12" style={{ alignItems: 'center' }}>
                <TicketPreview visit={panelVisit} showPrinter />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Printer}
                  block
                  onClick={() => openPrintFor(panelVisit)}
                >
                  Print Ticket
                </Button>
              </div>
            ) : (
              <p className="u-small u-muted">
                Select a checked-in patient to preview their queue ticket.
              </p>
            )}
          </Card>

          <InfoNote>
            Queue numbers are assigned automatically at check-in, first come, first served. Tickets
            are only available for today&apos;s visits.
          </InfoNote>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(checkInTarget)}
        onClose={() => setCheckInTarget(null)}
        onConfirm={confirmCheckIn}
        busy={busy}
        eyebrow="Patient arrival"
        title="Check in this patient?"
        description="This adds the patient to today's waiting queue. A queue number will be assigned automatically in arrival order."
        icon={UserCheck}
        summary={
          checkInTarget ? (
            <>
              <strong>
                {checkInTarget.patientName} · {patientRef(checkInTarget.patientId)}
              </strong>
              <br />
              {checkInTarget.type} · Today, {checkInTarget.timeLabel}
              <br />
              {checkInTarget.doctorName} · {checkInTarget.specialty}
              <br />
              Payment: {checkInTarget.billing} (read-only)
            </>
          ) : null
        }
        confirmLabel="Check in patient"
        cancelLabel="Not yet"
      >
        <p className="u-xs u-muted" style={{ marginTop: 10 }}>
          The visit status will change from Upcoming to Present.
        </p>
      </ConfirmDialog>

      <Modal
        open={Boolean(printVisit)}
        onClose={() => setPrintVisit(null)}
        title="Print queue ticket"
        eyebrow="Front desk printer · GP-CN-TMB01"
        icon={Printer}
        wide
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPrintVisit(null)}>
              Close
            </Button>
            <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
              Send to printer
            </Button>
          </>
        }
      >
        {printVisit ? (
          <div className="u-center">
            <TicketPreview visit={printVisit} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        busy={busy}
        eyebrow="Delete visit"
        title="Delete this visit?"
        description="This permanently removes the visit from the schedule and the waiting queue, if checked in. The patient record and other visits are kept."
        icon={Trash2}
        tone="danger"
        summary={
          deleteTarget ? (
            <>
              <strong>
                {deleteTarget.id} · {deleteTarget.patientName}
              </strong>
              <br />
              {deleteTarget.type} · {deleteTarget.timeLabel}
              <br />
              {deleteTarget.doctorName} · {deleteTarget.specialty}
            </>
          ) : null
        }
        confirmLabel="Delete visit"
        cancelLabel="Keep visit"
      >
        <p className="u-xs u-muted" style={{ marginTop: 10 }}>
          This action cannot be undone. Payment status is not changed.
        </p>
      </ConfirmDialog>
    </>
  )
}
