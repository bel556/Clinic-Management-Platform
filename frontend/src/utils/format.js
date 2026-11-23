const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function toDate(value) {
  if (value instanceof Date) return value
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/** 29 October 2024 */
export function formatDate(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** 29 Oct 2024 */
export function formatDateShort(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

/** Tue, 29 Oct */
export function formatDayShort(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()].slice(0, 3)}`
}

/** Tuesday, 29 October 2024 */
export function formatDayLong(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** 09:30 AM */
export function formatTime(value) {
  const d = toDate(value)
  if (!d) return '—'
  let hours = d.getHours()
  const suffix = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${String(hours).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${suffix}`
}

/** Mon, Oct 28 · 09:42 AM */
export function formatStamp(value) {
  const d = toDate(value)
  if (!d) return '—'
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()} · ${formatTime(d)}`
}

export function formatAge(birthDate) {
  const d = toDate(birthDate)
  if (!d) return '—'
  const now = new Date('2024-10-29T09:42:00')
  let age = now.getFullYear() - d.getFullYear()
  const beforeBirthday =
    now.getMonth() < d.getMonth() ||
    (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())
  if (beforeBirthday) age -= 1
  return `${age} yrs`
}

export function initials(name = '') {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function dateKey(value) {
  const d = toDate(value)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export function addDays(value, days) {
  const d = new Date(toDate(value) ?? new Date())
  d.setDate(d.getDate() + days)
  return d
}

export function iso(value) {
  return toDate(value)?.toISOString() ?? null
}

export function plural(count, word, wordPlural) {
  return `${count} ${count === 1 ? word : wordPlural ?? `${word}s`}`
}
