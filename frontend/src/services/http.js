/**
 * Single HTTP client for the FastAPI backend.
 *
 * `apiFetch` parses FastAPI's `{ detail }` error bodies, attaches
 * `error.status`, and reports non-404 failures to the global error channel so
 * the UI can surface them (see services/events.js).
 */
import { reportError } from './events'

export const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    const error = new ApiError(
      `Cannot reach the clinic API at ${API_BASE_URL}. Is the backend running?`,
      0,
    )
    reportError(error)
    throw error
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const payload = await response.json()
      detail = payload?.detail ?? JSON.stringify(payload)
    } catch {
      /* keep statusText */
    }
    const error = new ApiError(String(detail), response.status)
    // 404 is a normal "nothing there" answer for list endpoints.
    if (response.status !== 404) reportError(error)
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

/** Treat 404 as "no rows" for list endpoints that signal emptiness that way. */
export async function apiFetchSafe(path, options, fallback = []) {
  try {
    return await apiFetch(path, options)
  } catch (error) {
    if (error.status === 404) return fallback
    throw error
  }
}

/** Simulated network latency so loading states behave like the real API (mock mode only). */
export function delay(value, ms = 120) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}
