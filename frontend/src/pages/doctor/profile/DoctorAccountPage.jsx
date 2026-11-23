import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { Button, Card, ConfirmDialog, Toggle } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { AccountInfoCard } from '../../../components/profile/ProfileCards'
import { useSession } from '../../../services/session'
import { useDocumentTitle } from '../../../utils/hooks'
import p from '../../../components/profile/profile.module.css'

export default function DoctorAccountPage() {
  useDocumentTitle('Doctor profile')
  const navigate = useNavigate()
  const { users, availability, setAvailability, logOut } = useSession()
  const user = users.doctor
  const [logoutOpen, setLogoutOpen] = useState(false)

  const confirmLogout = () => {
    setLogoutOpen(false)
    logOut()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Doctor profile"
        description="Your account details and clinic presence."
        backTo="/doctor/profile"
        backLabel="Back to full profile"
      />

      <div className={p.profileGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AccountInfoCard
            user={user}
            role={user.role}
            location={user.workLocation}
            note="Managed by Clinic Administration. Name and email are read-only."
          />

          <Card title="Clinical availability" icon={ShieldCheck}>
            <Toggle
              checked={availability}
              onChange={setAvailability}
              label="Available for scheduling"
              description="Manage real-time scheduling status for reception and emergency routing."
            />
          </Card>

          <div>
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={() => setLogoutOpen(true)}
            >
              Log out
            </Button>
          </div>
        </div>

        <div className={p.profileSide}>
          <Card title="Account summary">
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Role</p>
                <p className={p.rowValue}>{user.role}</p>
              </div>
            </div>
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Work location</p>
                <p className={p.rowValue}>{user.workLocation}</p>
              </div>
            </div>
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Consultation slot</p>
                <p className={p.rowValue}>{user.slotLength}</p>
              </div>
            </div>
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Shift</p>
                <p className={p.rowValue}>
                  {user.shiftLabel} · {user.shiftHours}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        eyebrow="End your session"
        title="Log out of CuraPulse?"
        description="Your session on this workstation will end. Save any unsaved clinical notes before leaving."
        icon={LogOut}
        tone="danger"
        summary={
          <>
            <strong>{user.name}</strong>
            <br />
            {user.email}
            <br />
            Doctor · {user.workLocation}
          </>
        }
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
      >
        <p className="u-xs u-muted" style={{ marginTop: 10 }}>
          Logging out does not cancel appointments or change your saved availability status.
        </p>
      </ConfirmDialog>
    </>
  )
}
