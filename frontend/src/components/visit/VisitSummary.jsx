import { CheckCircle2, Printer } from 'lucide-react'
import { BillingBadge, Card, StatusBadge } from '../common'
import { CLINIC } from '../../utils/constants'
import { formatDate, formatTime, patientRef, visitRef } from '../../utils/format'
import s from './visit.module.css'

export function VisitSummary({ visit, actions, footer, title = 'Visit summary', checkedInNote }) {
  return (
    <Card title={title}>
      <div className={s.summaryGrid}>
        <div>
          <p className={s.summaryLabel}>Patient</p>
          <div className={s.summaryValue}>
            {visit.patientName} · {patientRef(visit.patientId)}
          </div>
        </div>
        <div>
          <p className={s.summaryLabel}>Visit ID</p>
          <div className={s.summaryValue}>{visitRef(visit.id)}</div>
        </div>
        <div>
          <p className={s.summaryLabel}>Visit type</p>
          <div className={s.summaryValue}>{visit.type}</div>
        </div>
        <div>
          <p className={s.summaryLabel}>Doctor</p>
          <div className={s.summaryValue}>
            {visit.doctorName} · {visit.specialty}
          </div>
        </div>
        <div>
          <p className={s.summaryLabel}>Payment</p>
          <div className={s.summaryValue}>
            {visit.billing} · <span className="u-muted">read-only</span>
          </div>
        </div>
        {visit.reason ? (
          <div>
            <p className={s.summaryLabel}>Reason for visit</p>
            <div className={s.summaryValue}>{visit.reason}</div>
          </div>
        ) : null}
      </div>

      {checkedInNote ? (
        <p className="u-small u-muted" style={{ marginTop: 12 }}>
          {checkedInNote}
        </p>
      ) : null}

      {actions ? (
        <div className="u-row u-g8 u-wrap" style={{ marginTop: 14 }}>
          {actions}
        </div>
      ) : null}
      {footer}
    </Card>
  )
}

export function DetailRow({ label, children, plain = false }) {
  return (
    <div className={s.detailRow}>
      <p className={s.detailLabel}>{label}</p>
      <div className={`${s.detailValue} ${plain ? s.detailValuePlain : ''}`}>{children}</div>
    </div>
  )
}

export function VisitChips({ visit }) {
  return (
    <div className="u-row u-g6 u-wrap">
      <StatusBadge status={visit.status} />
      <BillingBadge billing={visit.billing} />
      {visit.queue ? (
        <span className="u-mono u-small u-muted">Queue {visit.queueLabel}</span>
      ) : null}
    </div>
  )
}

export function TicketPreview({ visit, patient, showPrinter = true, className = '' }) {
  const person = patient ?? visit.patient
  const checkedIn = visit.checkedInAt ? formatTime(visit.checkedInAt) : formatTime(visit.date)

  return (
    <div className={`${s.ticket} print-sheet ${className}`.trim()}>
      <p className={s.ticketBrand}>CURAPULSE</p>
      <p className={s.ticketBrand}>
        <span style={{ fontSize: 10.5, letterSpacing: '0.16em' }}>CLINIC</span>
      </p>
      <p className={s.ticketBrandSub}>
        {CLINIC.address}
        <br />
        {CLINIC.phone}
      </p>

      <hr className={s.ticketDivider} />

      <p className={s.ticketLabel}>Queue number</p>
      <p className={s.ticketQueue}>{visit.queueLabel}</p>
      <p className={s.ticketCheckedIn}>Checked in: {checkedIn}</p>

      <hr className={s.ticketDivider} />

      <div className={s.ticketRows}>
        <TicketRow label="Patient" value={visit.patientName} />
        <TicketRow label="Patient ID" value={patientRef(visit.patientId)} />
        <TicketRow label="Attending" value={`${visit.doctorName} · ${visit.specialty}`} />
        <TicketRow label="Location" value={`${visit.room} · Downtown Center`} />
        <TicketRow label="Date" value={`${formatDate(visit.date)} · ${visit.timeLabel}`} />
        {person?.birthDate ? <TicketRow label="DOB" value={formatDate(person.birthDate)} /> : null}
      </div>

      <div className={s.barcode} />
      <p className={s.barcodeText}>*{String(visit.id).replace(/-/g, '')}*</p>

      <p className={s.ticketInstructions}>
        Please monitor the center screen for your number announcement.
      </p>

      {showPrinter ? (
        <>
          <div className={s.printerRow}>
            <Printer size={13} />
            Direct Thermal Print
          </div>
          <div className={s.printerMeta}>
            <span>Front Desk Printer (GP-CN-TMB01)</span>
            <span className={s.printerReady}>READY</span>
          </div>
        </>
      ) : null}
    </div>
  )
}

function TicketRow({ label, value }) {
  return (
    <div className={s.ticketRow}>
      <span className={s.ticketRowKey}>{label}</span>
      <span className={s.ticketRowValue}>{value}</span>
    </div>
  )
}

export function SuccessBanner({ title, children }) {
  return (
    <div className="u-rowTop u-g12">
      <span className={s.successIcon}>
        <CheckCircle2 size={18} />
      </span>
      <div>
        <h1 className={s.successTitle}>{title}</h1>
        {children}
      </div>
    </div>
  )
}
