import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ban,
  CalendarCheck2,
  CalendarClock,
  CalendarPlus,
  History,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRoundCheck,
  Users,
  Zap,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorPane,
  Field,
  IconButton,
  InfoNote,
  LoadingPane,
  SearchInput,
  StatusBadge,
  Tabs,
  Textarea,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { cancelAppointment, cancelDay, listDoctorCalendar } from '../../../services/appointments'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { dateKey, formatDate, formatDayLong, formatTime, now, patientRef, tomorrowKey, visitRef } from '../../../utils/format'
import { useSession } from '../../../services/session'
import s from '../doctorPages.module.css'

export default function DoctorVisitsPage() {
  useDocumentTitle('My Visits & Calendar')
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [dayOpen, setDayOpen] = useState(false)
  const [dayReason, setDayReason] = useState('')
  const [busy, setBusy] = useState(false)

  const { doctorId: DOCTOR_ID } = useSession()
  const TOMORROW = tomorrowKey()
  const { data, loading, error, reload } = useAsync(
    () => (DOCTOR_ID ? listDoctorCalendar(DOCTOR_ID) : Promise.resolve(null)),
    [DOCTOR_ID],
  )

  const upcoming = useMemo(() => data?.upcoming ?? [], [data])
  const tomorrowRows = upcoming.filter((visit) => dateKey(visit.date) === TOMORROW)

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return upcoming
      .filter((visit) => {
        if (!needle) return true
        return (
          visit.patientName.toLowerCase().includes(needle) ||
          patientRef(visit.patientId).toLowerCase().includes(needle) ||
          String(visit.patientId).includes(needle) ||
          visitRef(visit.id).toLowerCase().includes(needle)
        )
      })
      .filter((visit) => {
        if (dateFilter === 'today') return dateKey(visit.date) === dateKey(now())
        if (dateFilter === 'tomorrow') return dateKey(visit.date) === TOMORROW
        return true
      })
      .filter((visit) => (typeFilter === 'all' ? true : visit.type === typeFilter))
  }, [upcoming, search, dateFilter, typeFilter, TOMORROW])

  const confirmCancel = async () => {
    if (!cancelTarget || !cancelReason.trim()) return
    setBusy(true)
    try {
      await cancelAppointment(cancelTarget.id, { reason: cancelReason })
      toast.push(`Appointment ${visitRef(cancelTarget.id)} cancelled. Reception notified.`)
      setCancelTarget(null)
      setCancelReason('')
      reload()
    } finally {
      setBusy(false)
    }
  }

  const confirmCancelDay = async () => {
    if (!dayReason.trim()) return
    setBusy(true)
    try {
      const affected = await cancelDay({
        doctorId: DOCTOR_ID,
        date: TOMORROW,
        reason: dayReason,
      })
      toast.push(`${affected.length} appointments cancelled. Reception notified.`)
      setDayOpen(false)
      setDayReason('')
      reload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="My Visits & Calendar"
        description="Manage assignments, patient consultations, slot revisions, and reception handoffs."
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={Ban}
              onClick={() => navigate('/doctor/visits/day/affected')}
            >
              Cancel Entire Day
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CalendarPlus}
              onClick={() => navigate('/doctor/visits/new')}
            >
              Assign New Appointment
            </Button>
          </>
        }
      />

      <div className={s.kpiGrid}>
        <Kpi
          icon={CalendarCheck2}
          label="Scheduled today"
          value={data?.stats.scheduledToday ?? 0}
          sub={
            data?.stats.nextPatient ? (
              <>
                Next: <strong>{data.stats.nextPatient}</strong>
              </>
            ) : (
              'No pending patients'
            )
          }
        />
        <Kpi
          icon={CalendarClock}
          label="Tomorrow projected"
          value={data?.stats.tomorrowProjected ?? 0}
          sub={<>Appointments booked for tomorrow</>}
        />
        <Kpi
          icon={RefreshCw}
          label="Completed today"
          value={data?.stats.completedToday ?? 0}
          sub={
            <>
              {data?.stats.missedToday ?? 0} missed · first check-in{' '}
              {data?.stats.firstCheckIn ?? '—'}
            </>
          }
        />
        <Kpi
          icon={History}
          label="Historical total"
          value={data?.stats.historicalTotal ?? 0}
          sub={<>Logged visits for this doctor</>}
        />
      </div>

      <div className={s.toolbar}>
        <Tabs
          tabs={[
            { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
            { id: 'history', label: 'History', count: data?.stats.historicalTotal ?? 0 },
          ]}
          value="upcoming"
          onChange={(value) => {
            if (value === 'history') navigate('/doctor/visits/history')
          }}
        />
        <div className={s.toolbarEnd}>
          <div style={{ width: 210 }}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search my visits…"
            />
          </div>
          <select
            className={s.filterSelect}
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            aria-label="Filter by day"
          >
            <option value="all">All Days</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
          </select>
          <select
            className={s.filterSelect}
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="Regular">Regular</option>
            <option value="Appointment">Appointment</option>
            <option value="Consultation">Consultation</option>
          </select>
          <IconButton icon={RefreshCw} label="Reload" boxed onClick={reload} />
        </div>
      </div>

      {loading ? (
        <LoadingPane label="Loading your calendar…" />
      ) : error ? (
        <ErrorPane error={error} onRetry={reload} />
      ) : (
        <Card padded={false}>
          <div className="u-scroll">
            <table className={s.mappingTable}>
              <thead>
                <tr>
                  <th style={{ width: 28 }} />
                  <th>Date &amp; time</th>
                  <th>Patient (name + ID)</th>
                  <th>Visit type</th>
                  <th>Status</th>
                  <th>Billing</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((visit) => (
                  <tr key={visit.id}>
                    <td>
                      <input type="checkbox" className={s.checkbox} aria-label="Select visit" />
                    </td>
                    <td>
                      <div className={s.visitTime}>
                        <span className={s.visitTimeLabel}>
                          {dateKey(visit.date) === dateKey(now()) ? 'Today' : visit.dayLabel},{' '}
                          {formatTime(visit.date)}
                        </span>
                        <span className={s.visitTimeSub}>
                          {visit.room} · {visit.specialty}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={s.patientCell}>
                        <span className={s.patientName}>{visit.patientName}</span>
                        <span className={s.patientId}>{patientRef(visit.patientId)}</span>
                      </div>
                    </td>
                    <td>{visit.type}</td>
                    <td>
                      <StatusBadge status={visit.status} />
                    </td>
                    <td>{visit.billing}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCancelTarget(visit)
                          setCancelReason('')
                        }}
                        disabled={visit.status === 'Cancelled'}
                      >
                        Cancel
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length ? (
            <EmptyState
              icon={CalendarClock}
              title="No upcoming visits"
              description="Adjust the filters or assign a new appointment."
            />
          ) : null}
          <div className="u-between" style={{ padding: '9px 14px', borderTop: '1px solid var(--border-soft)' }}>
            <span className="u-xs u-muted">
              Displaying {rows.length} of {upcoming.length} upcoming clinical consultations
            </span>
            <Badge tone="green" dot>
              Reception sync · live
            </Badge>
          </div>
        </Card>
      )}

      <div className={s.protocolCard}>
        <span className={s.protocolIcon}>
          <Zap size={14} />
        </span>
        <div className="u-grow">
          <p className={s.protocolTitle}>
            Cancelled <span>AUTOMATED PROTOCOL</span>
          </p>
          <p className={s.protocolText}>
            Cancelling tomorrow, {formatDate(TOMORROW)} affects {tomorrowRows.length} scheduled
            patients for {data?.doctor?.name ?? 'your clinic'}.
          </p>
          <div className={s.protocolList}>
            <span>
              <Users size={10} /> Reception desk cleared
            </span>
            <span>
              <UserRoundCheck size={10} /> Inform patients
            </span>
            <span>
              <ShieldCheck size={10} /> Zero penalties for physician emergency calls
            </span>
            <span>
              <Stethoscope size={10} /> {formatDayLong(TOMORROW)}
            </span>
          </div>
        </div>
        <div className={s.protocolActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/doctor/visits/day/affected')}
          >
            Preview Affected List
          </Button>
          <Button variant="primary" size="sm" onClick={() => setDayOpen(true)}>
            Confirm Day Cancellation
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        busy={busy}
        eyebrow="Doctor · Cancel appointment"
        title="Cancel this appointment?"
        description="Reception will receive a cancellation notification with a link to the affected visit and will contact the patient."
        icon={Ban}
        tone="danger"
        confirmDisabled={!cancelReason.trim()}
        summary={
          cancelTarget ? (
            <>
              <strong>
                {cancelTarget.patientName} · {patientRef(cancelTarget.patientId)}
              </strong>
              <br />
              {cancelTarget.type} · Today, {cancelTarget.timeLabel}
              <br />
              {cancelTarget.doctorName}
            </>
          ) : null
        }
        confirmLabel="Cancel appointment"
        cancelLabel="Keep appointment"
      >
        <div style={{ marginTop: 10 }}>
          <Field label="Reason" required>
            <Textarea
              rows={2}
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              placeholder="Emergency procedure in surgical wing B"
            />
          </Field>
          <p className="u-xs u-muted" style={{ marginTop: 8 }}>
            The visit is retained for reception to review, modify or delete.
          </p>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={dayOpen}
        onClose={() => setDayOpen(false)}
        onConfirm={confirmCancelDay}
        busy={busy}
        eyebrow="Doctor · Day-wide change"
        title={`Cancel all ${tomorrowRows.length} appointments?`}
        description="All appointments and consultations will be cancelled for the selected day. Today's queue is not affected."
        icon={Ban}
        tone="danger"
        confirmDisabled={!dayReason.trim()}
        summary={
          <>
            <strong>{formatDayLong(TOMORROW)}</strong>
            <br />
            {tomorrowRows.length} patients · {formatTime('2024-10-30T09:00:00')} –{' '}
            {formatTime('2024-10-30T15:00:00')}
            <br />
            {tomorrowRows.filter((visit) => visit.type === 'Appointment').length} appointments ·{' '}
            {tomorrowRows.filter((visit) => visit.type === 'Consultation').length} consultations
          </>
        }
        confirmLabel={`Cancel all ${tomorrowRows.length} visits`}
        cancelLabel="Keep schedule"
      >
        <div style={{ marginTop: 10 }}>
          <Field label="Reason" required>
            <Textarea
              rows={2}
              value={dayReason}
              onChange={(event) => setDayReason(event.target.value)}
              placeholder="Emergency medical leave"
            />
          </Field>
          <div style={{ marginTop: 8 }}>
            <InfoNote>
              Reception will receive the affected patient list and must contact all{' '}
              {tomorrowRows.length} patients.
            </InfoNote>
          </div>
        </div>
      </ConfirmDialog>
    </>
  )
}

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className={s.kpiCard}>
      <div className={s.kpiTop}>
        <span className={s.kpiLabel}>{label}</span>
        <span className={s.kpiIcon}>
          <Icon size={13} />
        </span>
      </div>
      <span className={s.kpiValue}>{value}</span>
      <span className={s.kpiSub}>{sub}</span>
    </div>
  )
}
