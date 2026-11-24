import { Check, Pencil, Printer, RotateCcw, Trash2, X } from 'lucide-react'
import { Button, DataTable, IconButton, StatusBadge, BillingBadge } from '../common'
import { patientRef } from '../../utils/format'
import s from './visit.module.css'

export function VisitTable({
  rows,
  onOpen,
  onCheckIn,
  onPrint,
  onEdit,
  onDelete,
  onReschedule,
  onLateCheckIn,
  showDoctor = true,
  showBilling = true,
  empty,
}) {
  const columns = [
    {
      key: 'time',
      header: 'Time',
      render: (visit) => (
        <div className={s.timeCell}>
          <span>{visit.timeLabel}</span>
          {visit.queue ? (
            <span className={s.queueTag}>{visit.queueLabel}</span>
          ) : (
            <span className={s.subtle}>{visit.status === 'Upcoming' ? 'Slot ' + (visit.slot?.split(' – ')[0] || '—') : ''}</span>
          )}
        </div>
      ),
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (visit) => (
        <div className={s.patientCell}>
          <span className={s.patientName}>{visit.patientName}</span>
          <span className={s.subtle}>{patientRef(visit.patientId)}</span>
        </div>
      ),
    },
    ...(showDoctor
      ? [
          {
            key: 'doctor',
            header: 'Doctor',
            render: (visit) => (
              <div className={s.patientCell}>
                <span>{visit.doctorName}</span>
                <span className={s.subtle}>{visit.specialty}</span>
              </div>
            ),
          },
        ]
      : []),
    { key: 'type', header: 'Visit type', render: (visit) => visit.type },
    {
      key: 'status',
      header: 'Status',
      render: (visit) => <StatusBadge status={visit.status} />,
    },
    ...(showBilling
      ? [
          {
            key: 'billing',
            header: 'Billing',
            render: (visit) => <BillingBadge billing={visit.billing} />,
          },
        ]
      : []),
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (visit) => (
        <div className={s.actions} onClick={(event) => event.stopPropagation()}>
          {visit.status === 'Upcoming' && onCheckIn ? (
            <>
              <Button variant="primary" size="sm" onClick={() => onCheckIn(visit)}>
                Check-in
              </Button>
              {onLateCheckIn ? (
                <Button variant="secondary" size="sm" onClick={() => onLateCheckIn(visit)}>
                  Late check-in
                </Button>
              ) : null}
            </>
          ) : null}

          {visit.status === 'Present' && onPrint ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={() => onPrint(visit)}
            >
              Print Ticket
            </Button>
          ) : null}

          {visit.status === 'Missed' && (onLateCheckIn || onReschedule) ? (
            <>
              {onLateCheckIn ? (
                <Button variant="secondary" size="sm" onClick={() => onLateCheckIn(visit)}>
                  Late check-in
                </Button>
              ) : null}
              {onReschedule ? (
                <Button variant="secondary" size="sm" icon={RotateCcw} onClick={() => onReschedule(visit)}>
                  Reschedule
                </Button>
              ) : null}
            </>
          ) : null}

          {onEdit ? <IconButton icon={Pencil} label="Edit visit" onClick={() => onEdit(visit)} /> : null}
          {onDelete ? (
            <IconButton
              icon={Trash2}
              label="Delete visit"
              tone="danger"
              onClick={() => onDelete(visit)}
            />
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(visit) => visit.id}
      onRowClick={onOpen}
      empty={empty}
    />
  )
}

export function VisitActionCheck() {
  return <Check size={12} />
}

export function VisitActionX() {
  return <X size={12} />
}
