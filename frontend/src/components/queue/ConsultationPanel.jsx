import { useState } from 'react'
import {
  Ban,
  CircleDot,
  ClipboardList,
  History,
  PanelRightOpen,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { Button, EmptyState, InfoNote, StatusBadge } from '../common'
import { formatAge, formatDate, formatTime } from '../../utils/format'
import { patientRef } from '../../utils/format'
import s from './queue.module.css'

export function ConsultationPanel({
  consultation,
  onViewHistory,
  onSaveDraft,
  onMarkDone,
  onMarkMissed,
  busy,
}) {
  const [notes, setNotes] = useState(() => consultation?.draft?.content ?? '')
  const [savedAt, setSavedAt] = useState(null)

  if (!consultation) {
    return (
      <div className={s.consultCard}>
        <EmptyState
          icon={ClipboardList}
          title="Select a patient"
          description="Choose a patient from today's queue to open their consultation panel."
        />
      </div>
    )
  }

  const { visit, patient, previousEncounter } = consultation

  const saveDraft = async () => {
    await onSaveDraft?.(notes)
    setSavedAt(new Date())
  }

  return (
    <div className={s.consultCard}>
      <div className={s.consultHead}>
        <span className={s.consultQueue}>{visit.queueLabel}</span>
        <div className="u-grow">
          <h2 className={s.consultName}>
            {visit.patientName} <span className={s.consultId}>({patientRef(visit.patientId)})</span>
          </h2>
          <div className={s.consultMeta}>
            <span>{formatAge(patient?.birthDate)}</span>
            <span>·</span>
            <span>DOB {formatDate(patient?.birthDate)}</span>
            <span>·</span>
            <span>Phone {patient?.phone}</span>
            <span>·</span>
            <span>Visit: {visit.type}</span>
          </div>
        </div>
        <StatusBadge status={visit.status} />
      </div>

      <button type="button" className={s.historyLink} onClick={onViewHistory}>
        <PanelRightOpen size={13} />
        View Full Patient Profile &amp; History
      </button>

      <div className={s.panelSection}>
        <div className={s.panelSectionHead}>
          <span className="u-row u-g6">
            <History size={13} />
            Clinical baseline
          </span>
          <span className={s.panelSectionSub}>Blood type {patient?.bloodType || '—'}</span>
        </div>
        <div className={s.consultMeta} style={{ flexWrap: 'wrap', gap: 8 }}>
          <span>
            Allergies:{' '}
            {patient?.allergies?.length ? patient.allergies.join(' · ') : 'none recorded'}
          </span>
          <span>·</span>
          <span>
            Conditions:{' '}
            {patient?.conditions?.length ? patient.conditions.join(' · ') : 'none recorded'}
          </span>
        </div>
      </div>

      <div className={s.panelSection}>
        <div className={s.panelSectionHead}>
          <span className="u-row u-g6">
            <History size={13} />
            Medical History Summary
          </span>
          <span className={s.panelSectionSub}>Cross-Specialty Records</span>
        </div>

        {previousEncounter ? (
          <div className={s.historyBox}>
            <div className={s.historyTop}>
              <span>
                <strong>Previous Encounter</strong> · {formatDate(previousEncounter.visit.date)} by{' '}
                {previousEncounter.visit.doctorName}
              </span>
              <span className={s.panelSectionSub}>{previousEncounter.visit.specialty}</span>
            </div>
            <p className={s.historyText}>{previousEncounter.content}</p>
          </div>
        ) : (
          <InfoNote>No previous encounter recorded for this patient.</InfoNote>
        )}
      </div>

      {consultation.allergyList?.length ? (
        <div className={s.panelSection}>
          <InfoNote tone="danger" icon={ShieldCheck}>
            <strong>Allergies:</strong> {consultation.allergyList.join(' · ')}
            {consultation.conditionList?.length ? (
              <>
                <br />
                <strong>Conditions:</strong> {consultation.conditionList.join(' · ')}
              </>
            ) : null}
          </InfoNote>
        </div>
      ) : null}

      <div className={s.panelSection}>
        <div className={s.panelSectionHead}>
          <span className="u-row u-g6">
            <CircleDot size={13} />
            Consultation &amp; Clinical Notes
          </span>
          <span className={s.autosaved}>
            {savedAt ? (
              <>
                <Save size={10} /> Draft saved {formatTime(savedAt)}
              </>
            ) : (
              'Auto-saved at 09:41 AM'
            )}
          </span>
        </div>
        <textarea
          className={s.noteArea}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Clinical observations, diagnostic impression & plan…"
        />
      </div>

      <div className={s.consultFooter}>
        <Button variant="secondary" size="sm" icon={Ban} onClick={onMarkMissed} disabled={busy}>
          Mark as Missed
        </Button>
        <Button variant="secondary" size="sm" icon={Save} onClick={saveDraft} disabled={busy}>
          Save Draft
        </Button>
        <span className={s.spacer} />
        <Button
          variant="primary"
          size="sm"
          onClick={() => onMarkDone?.(notes)}
          disabled={busy}
        >
          Mark as Done
        </Button>
      </div>
    </div>
  )
}
