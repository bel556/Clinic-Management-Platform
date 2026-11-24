import { apiFetch } from '../http'
import { toId } from '../config'
import { toEmployee } from '../adapters'

export async function listEmployees({ role } = {}) {
  const params = role ? `?role=${encodeURIComponent(role)}` : ''
  const rows = await apiFetch(`/employees${params}`)
  return (rows ?? []).map(toEmployee)
}

export async function getEmployee(employeeId) {
  return toEmployee(await apiFetch(`/employees/${encodeURIComponent(toId(employeeId))}`))
}

export async function getEmployeeAvailability(employeeId) {
  return toEmployee(
    await apiFetch(`/employees/${encodeURIComponent(toId(employeeId))}/availability`),
  )
}

export async function updateEmployeeAvailability(employeeId, available) {
  const status =
    typeof available === 'string'
      ? available.toLowerCase()
      : available
        ? 'present'
        : 'absent'
  const updated = await apiFetch(
    `/employees/${encodeURIComponent(toId(employeeId))}/availability`,
    { method: 'PATCH', body: { status } },
  )
  return toEmployee(updated)
}
