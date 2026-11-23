import { Button, DataTable } from '../common'
import { formatAge, formatDate } from '../../utils/format'
import s from './patient.module.css'

export function PatientTable({ rows, onOpen, onAddVisit, empty, bare = false }) {
  const columns = [
    {
      key: 'id',
      header: 'Patient ID',
      render: (patient) => <span className="u-nowrap">{patient.id}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (patient) => <span className="u-strong">{patient.fullName}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (patient) => <span className="u-nowrap">{patient.phone}</span>,
    },
    {
      key: 'dob',
      header: 'DOB / Age',
      render: (patient) => (
        <span className="u-nowrap">
          {formatDate(patient.birthDate)} <span className="u-muted">({formatAge(patient.birthDate)})</span>
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (patient) => (
        <div className={s.actions} onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => onOpen?.(patient)}>
            Detail
          </Button>
          <Button variant="primary" size="sm" onClick={() => onAddVisit?.(patient)}>
            Add Visit
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(patient) => patient.id}
      onRowClick={onOpen}
      empty={empty}
      bare={bare}
    />
  )
}
