import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  ErrorPane,
  LoadingPane,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import {
  AccountInfoCard,
  PresenceCard,
  StaffStatsCard,
} from '../../../components/profile/ProfileCards'
import { listVisitBoard } from '../../../services/visits'
import { useSession } from '../../../services/session'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import { now, todayKey } from '../../../utils/format'
import s from '../reception.module.css'
import p from '../../../components/profile/profile.module.css'

function buildStats(board) {
  const rows = board?.rows ?? []
  const counts = board?.counts ?? {}
  const total = counts.all ?? rows.length
  const completed = counts.Done ?? 0
  const exception = (counts.Missed ?? 0) + rows.filter((v) => v.status === 'Cancelled').length
  const waiting = rows.filter((v) => v.status === 'Present' && v.checkedInAt)

  const avgMinutes = waiting.length
    ? Math.round(
        waiting.reduce(
          (sum, visit) => sum + Math.max(0, now().getTime() - new Date(visit.checkedInAt).getTime()),
          0,
        ) /
          waiting.length /
          60000,
      )
    : null

  return {
    completed,
    total,
    waiting: waiting.length,
    exceptionRate: total ? `${Math.round((exception / total) * 100)}%` : '—',
    avgWait: avgMinutes === null ? '—' : `${avgMinutes}m`,
  }
}

export default function ReceptionProfilePage() {
  useDocumentTitle('Staff profile')
  const navigate = useNavigate()
  const { users, presence, setPresence, logOut } = useSession()
  const user = users.receptionist
  const [logoutOpen, setLogoutOpen] = useState(false)

  const { data: board, loading, error, reload } = useAsync(
    () => listVisitBoard({ day: todayKey(), pageSize: 500 }),
    [],
  )
  const stats = useMemo(() => buildStats(board), [board])

  const confirmLogout = () => {
    setLogoutOpen(false)
    logOut()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Staff profile"
        description="Your clinic account, working schedule and operational presence."
      />

      {loading ? <LoadingPane label="Loading profile…" /> : null}
      {!loading && error ? <ErrorPane error={error} onRetry={reload} /> : null}

      {!loading && !error ? (
        <div className={p.profileGrid}>
          <div className={s.stack}>
            <PresenceCard
              value={presence}
              onChange={setPresence}
              action={
                <Badge tone={presence === 'Present' ? 'green' : 'slate'} dot>
                  {presence}
                </Badge>
              }
            />

            <AccountInfoCard
              user={user}
              role={user.role}
              location={user.room || user.workLocation}
              note="Managed by clinic administration."
              action={<Badge tone="slate">Read-only</Badge>}
            />

            <Card title="Contact & schedule" icon={ShieldCheck}>
              <div className="u-grid2">
                <div>
                  <p className={p.fieldLabel}>Phone</p>
                  <div className={p.fieldValue}>{user.phone || '—'}</div>
                </div>
                <div>
                  <p className={p.fieldLabel}>Email</p>
                  <div className={p.fieldValue}>{user.email || '—'}</div>
                </div>
                <div>
                  <p className={p.fieldLabel}>Schedule from</p>
                  <div className={p.fieldValue}>{user.startDay || '—'}</div>
                </div>
                <div>
                  <p className={p.fieldLabel}>Schedule to</p>
                  <div className={p.fieldValue}>{user.endDay || '—'}</div>
                </div>
              </div>
              <div className={p.dangerZone} style={{ marginTop: 14 }}>
                <Button variant="danger" size="sm" icon={LogOut} onClick={() => setLogoutOpen(true)}>
                  Log out
                </Button>
              </div>
            </Card>
          </div>

          <div className={p.profileSide}>
            <Card padded={false}>
              <div className={p.avatarCard}>
                <Avatar name={user.name} size="xl" />
                <div className={p.avatarName}>{user.name}</div>
                <div className={p.avatarRole}>{user.role}</div>
                <div className={p.avatarId}>ID · {user.ref ?? user.id}</div>
                <Badge tone={presence === 'Present' ? 'green' : 'slate'} dot>
                  {presence === 'Present' ? 'On duty' : 'Off duty'}
                </Badge>
              </div>
            </Card>

            <Card title="Today's stats" icon={UserRound}>
              <StaffStatsCard stats={stats} />
            </Card>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        eyebrow="End your session"
        title="Log out of CuraPulse?"
        description="Your session on this workstation will end. Save any unsaved information first."
        icon={LogOut}
        tone="danger"
        summary={
          <>
            <strong>{user.name}</strong>
            <br />
            {user.email}
          </>
        }
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
      />
    </>
  )
}
