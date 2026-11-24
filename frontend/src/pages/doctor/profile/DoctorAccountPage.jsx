import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { Button, Card, ConfirmDialog, Toggle } from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { AccountInfoCard } from '../../../components/profile/ProfileCards'
import { useSession } from '../../../services/session'
import { updateDoctorAvailability } from '../../../services/doctors'
import { useDocumentTitle } from '../../../utils/hooks'
import p from '../../../components/profile/profile.module.css'

export default function DoctorAccountPage() {
  useDocumentTitle('Doctor account')
  const navigate = useNavigate()
  const { users, availability, setAvailability, logOut } = useSession()
  const user = users.doctor
  const [logoutOpen, setLogoutOpen] = useState(false)

  const toggleAvailability = async (next) => {
    try {
      await updateDoctorAvailability(user.id, next)
    } finally {
      setAvailability(next)
    }
  }

  const confirmLogout = () => {
    setLogoutOpen(false)
    logOut()
    navigate('/login')
  }

  return (
    <>
      <PageHeader
        title="Doctor account"
        description="Account details and clinic presence."
        backTo="/doctor/profile"
        backLabel="Back to full profile"
      />

      <div className={p.profileGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AccountInfoCard
            user={user}
            role={user.role}
            location={user.room || '—'}
            note="Name, email and credentials are managed by clinic administration."
          />

          <Card title="Clinical availability" icon={ShieldCheck}>
            <Toggle
              checked={availability}
              onChange={toggleAvailability}
              label="Available for scheduling"
              description="Reception uses this status when assigning new visits."
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
          <Card title="Directory information">
            <div className="u-grid2">
              <div>
                <p className={p.fieldLabel}>Specialty</p>
                <div className={p.fieldValue}>{user.department}</div>
              </div>
              <div>
                <p className={p.fieldLabel}>Phone</p>
                <div className={p.fieldValue}>{user.phone || '—'}</div>
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
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
        eyebrow="End your session"
        title="Log out of CuraPulse?"
        description="Your session on this workstation will end."
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
