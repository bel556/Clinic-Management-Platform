import { DATA_SOURCE, DEMO_MODE } from '../utils/constants'

export { DATA_SOURCE, DEMO_MODE }

/** Backend identifiers are integers; URL/query parameters arrive as strings. */
export function toId(value) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : value
}
