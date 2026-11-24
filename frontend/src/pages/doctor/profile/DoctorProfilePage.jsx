import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, RotateCcw, ShieldCheck, UserRound } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  Toggle,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { ProfileHero, InfoField } from '../../../components/profile/ProfileCards'
import { useSession } from '../../../services/session'
import { updateDoctorAvailability } from '../../../services/doctors'
import { useDocumentTitle } from '../../../utils/hooks'
import p from '../../../components/profile/profile.module.css'

export default function DoctorProfilePage() {
  useDocumentTitle('Doctor profile')
  const navigate = useNavigate()
  const toast = useToast()
  const { users, availability, setAvailability } = useSession()
  const user = users.doctor
  const [draft, setDraft] = useState(availability)
  const [edited, setEdited] = useState(false)
  const current = edited ? draft : availability

  const save = async () => {
    try {
      await updateDoctorAvailability(user.id, current)
    } finally {
      setAvailability(current)
      setEdited(false)
      toast.push(
        current
          ? 'Availability saved: you are marked present.'
          : 'Availability saved: you are marked absent.',
      )
    }
  }

  const discard = () => {
    setEdited(false)
    toast.push('Unsaved changes discarded.', { tone: 'error' })
  }

  return (
    <>
      <PageHeader
        title="Doctor profile"
        description={`${user.name} · ${user.department}`}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={discard}>
              Discard changes
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={save}>
              Save changes
            </Button>
          </>
        }
      />

      <div className={p.profileGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProfileHero
            user={user}
            tags={[
              { label: 'Provider identifier', value: user.npi || 'Not recorded' },
              { label: 'Board license', value: user.license || 'Not recorded' },
              { label: 'Default slot', value: user.slotLength || '—' },
            ]}
          />

          <Card title="Contact" icon={UserRound}>
            <div className={p.accountGrid}>
              <InfoField label="Clinic email address" value={user.email || '—'} />
              <InfoField label="Phone" value={user.phone || '—'} />
              <InfoField label="Department" value={user.department} />
              <InfoField label="Consultation room" value={user.room || '—'} />
            </div>
          </Card>
        </div>

        <div className={p.profileSide}>
          <Card
            title="Clinical availability"
            icon={ShieldCheck}
            action={
              <Badge tone={current ? 'green' : 'slate'} dot>
                {current ? 'Present' : 'Absent'}
              </Badge>
            }
          >
            <Toggle
              checked={current}
              onChange={(next) => {
                setDraft(next)
                setEdited(true)
              }}
              label="Available for scheduling"
              description="Reception uses this status when assigning new visits."
            />
            <div style={{ marginTop: 12 }} className={p.accountGrid}>
              <InfoField label="Consultation room" value={user.room || '—'} />
              <InfoField label="Default consultation slot" value={user.slotLength || '—'} />
              <InfoField label="Schedule from" value={user.startDay || '—'} />
              <InfoField label="Schedule to" value={user.endDay || '—'} />
            </div>
          </Card>

          <Card title="Account" icon={Lock}>
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Account information</p>
                <p className={p.rowValue}>View the contact details stored for this account.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/doctor/profile/account')}
              >
                Open
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
