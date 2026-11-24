import { useState } from 'react'
import { PageHeader } from '../../../components/layout'
import { ErrorPane, SearchInput } from '../../../components/common'
import { DoctorList } from '../../../components/doctor/DoctorList'
import { DoctorAvailabilityGrid } from '../../../components/doctor/DoctorAvailabilityGrid'
import { getDoctorAvailability, listDoctors } from '../../../services/doctors'
import { useAsync, useDocumentTitle, useDebouncedValue } from '../../../utils/hooks'

export default function DoctorsPage() {
  useDocumentTitle('Doctors')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const debounced = useDebouncedValue(query, 160)

  const { data: doctors, loading, error, reload } = useAsync(
    () => listDoctors({ query: debounced }),
    [debounced],
  )
  const activeId = selectedId ?? doctors?.[0]?.id ?? null
  const { data: availability, loading: availabilityLoading } = useAsync(
    () => (activeId ? getDoctorAvailability(activeId) : Promise.resolve(null)),
    [activeId],
  )

  return (
    <>
      <PageHeader
        title="Doctors"
        description="Attending physicians, live presence and weekly availability."
        actions={
          <div style={{ width: 260 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search doctor name or specialty…"
            />
          </div>
        }
      />

      {error ? <ErrorPane error={error} onRetry={reload} /> : null}

      <div className="u-grid2" style={{ gridTemplateColumns: '320px minmax(0, 1fr)', alignItems: 'start' }}>
        <DoctorList
          doctors={doctors ?? []}
          selectedId={activeId}
          onSelect={setSelectedId}
          loading={loading}
        />
        <DoctorAvailabilityGrid data={availability} loading={availabilityLoading} />
      </div>
    </>
  )
}
