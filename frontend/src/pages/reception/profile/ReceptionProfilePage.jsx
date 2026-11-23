import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Avatar, Badge, Button, Card, ConfirmDialog } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import {
  AccountInfoCard,
  PresenceCard,
  StaffStatsCard,
} from '../../../components/profile/ProfileCards'
import { useSession } from '../../../services/session'
import { useDocumentTitle } from '../../../utils/hooks'
import s from '../reception.module.css'
import p from '../../../components/profile/profile.module.css'

export default function ReceptionProfilePage() {
  useDocumentTitle('Staff profile')
  const navigate = useNavigate()
  const { users, presence, setPresence, logOut } = useSession()
  const user = users.receptionist
  const [logoutOpen, setLogoutOpen] = useState(false)

  const confirmLogout = () => {
    setLogoutOpen(false)
    logOut()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Staff profile"
        description="Manage your clinic account, active shift credentials, and operational availability status."
      />

      <div className={p.profileGrid}>
        <div className={s.stack}>
          <PresenceCard
            value={presence}
            onChange={(next) => setPresence(next)}
            action={<Badge tone={presence === 'Present' ? 'green' : 'slate'} dot>{presence}</Badge>}
          />

          <AccountInfoCard
            user={user}
            role={user.role}
            location={user.workLocation}
            note="Managed by Clinic Administration. Name and email are read-only."
            action={<Badge tone="slate">Read-only</Badge>}
          />

          <Card title="Shift & terminal" icon={ShieldCheck}>
            <div className="u-grid2">
              <div>
                <p className={p.fieldLabel}>Assigned workstation</p>
                <div className={p.fieldValue}>{user.workstation}</div>
              </div>
              <div>
                <p className={p.fieldLabel}>Terminal IP</p>
                <div className={p.fieldValue}>{user.terminalIp}</div>
              </div>
              <div>
                <p className={p.fieldLabel}>Shift</p>
                <div className={p.fieldValue}>{user.shift}</div>
              </div>
              <div>
                <p className={p.fieldLabel}>Department</p>
                <div className={p.fieldValue}>{user.department}</div>
              </div>
            </div>
            <div className={p.dangerZone} style={{ marginTop: 14 }}>
              <Button
                variant="danger"
                size="sm"
                icon={LogOut}
                onClick={() => setLogoutOpen(true)}
              >
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
              <div className={p.avatarRole}>Front Desk Coordinator</div>
              <div className={p.avatarId}>ID · {user.id}</div>
              <Badge tone={presence === 'Present' ? 'green' : 'slate'} dot>
                {presence === 'Present' ? 'On duty' : 'Off duty'}
              </Badge>
            </div>
          </Card>

          <Card title="Today's stats" icon={UserRound}>
            <StaffStatsCard user={user} />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        eyebrow="End your session"
        title="Log out of CuraPulse?"
        description="Your session on this workstation will end. Save any unsaved patient or consultation information before leaving."
        icon={LogOut}
        tone="danger"
        summary={
          <>
            <strong>{user.name}</strong>
            <br />
            {user.email}
            <br />
            Reception · {user.workLocation}
          </>
        }
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
      >
        <p className="u-xs u-muted" style={{ marginTop: 10 }}>
          Logging out does not cancel appointments or change your saved presence status.
        </p>
      </ConfirmDialog>
    </>
  )
}
