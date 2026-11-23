import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Lock, RotateCcw, ShieldCheck, UserRound } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Toggle,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import {
  PracticeNotesCard,
  ProfileHero,
  SecurityCard,
  InfoField,
} from '../../../components/profile/ProfileCards'
import { useSession } from '../../../services/session'
import { useDocumentTitle } from '../../../utils/hooks'
import p from '../../../components/profile/profile.module.css'

export default function DoctorProfilePage() {
  useDocumentTitle('Doctor profile')
  const navigate = useNavigate()
  const toast = useToast()
  const { users, availability, setAvailability } = useSession()
  const user = users.doctor
  const [draft, setDraft] = useState(availability)
  const [pinOpen, setPinOpen] = useState(false)

  const save = () => {
    setAvailability(draft)
    toast.push('Profile changes saved.')
  }

  const discard = () => {
    setDraft(availability)
    toast.push('Unsaved changes discarded.', { tone: 'error' })
  }

  return (
    <>
      <PageHeader
        title="Doctor Profile"
        description={`${user.name} · ${user.department} Department`}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={RotateCcw} onClick={discard}>
              Discard Changes
            </Button>
            <Button variant="primary" size="sm" icon={Check} onClick={save}>
              Save Changes
            </Button>
          </>
        }
      />

      <div className={p.profileGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProfileHero
            user={user}
            tags={[
              { label: 'National provider identifier', value: user.npi },
              { label: 'Board license', value: user.license },
              { label: 'Clinical access level', value: user.accessLevel },
            ]}
          />

          <Card title="Contact & credentials" icon={UserRound}>
            <div className={p.accountGrid}>
              <InfoField label="Clinic email address" value={user.email} />
              <InfoField label="Direct extension" value={user.extension} />
              <InfoField label="Desk direct line" value={user.directLine} />
              <InfoField label="Department" value={user.department} />
            </div>
          </Card>

          <SecurityCard
            pinUpdated={user.pinUpdated}
            onReset={() => setPinOpen(true)}
          />
        </div>

        <div className={p.profileSide}>
          <Card
            title="Clinical availability"
            icon={ShieldCheck}
            action={<Badge tone={draft ? 'green' : 'slate'} dot>{draft ? 'Available' : 'Off duty'}</Badge>}
          >
            <Toggle
              checked={draft}
              onChange={setDraft}
              label="Real-time scheduling status"
              description="Manage real-time scheduling status for reception and emergency routing."
            />
            <div style={{ marginTop: 12 }} className={p.accountGrid}>
              <InfoField label="Assigned clinical space" value={user.assignedClinic} />
              <InfoField label="Default consultation slot" value={user.slotLength} />
            </div>
            <div className={p.shiftBox}>
              <span className="u-row u-g6">
                <span
                  style={{
                    display: 'inline-flex',
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: 'var(--teal-soft)',
                    color: 'var(--teal)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={12} />
                </span>
                Standard shifts
              </span>
              <span className="u-strong">{user.shiftLabel}</span>
              <Badge tone="teal">{user.shiftHours}</Badge>
            </div>
          </Card>

          <PracticeNotesCard notes={user.practiceNotes} detail={user.practiceNote} />

          <Card title="Workspace" icon={Lock}>
            <div className={p.cardRow}>
              <div>
                <p className={p.rowLabel}>Account view</p>
                <p className={p.rowValue}>Simplified read-only account information.</p>
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

      <ConfirmDialog
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onConfirm={() => {
          setPinOpen(false)
          toast.push('PIN reset link sent to the clinic administrator.')
        }}
        eyebrow="Security"
        title="Reset workstation PIN?"
        description="A reset link will be sent to the clinic administrator. Your current PIN stays active until the new one is confirmed."
        icon={Lock}
        confirmLabel="Send reset link"
        cancelLabel="Cancel"
      />
    </>
  )
}
