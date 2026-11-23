/**
 * Thin fetch wrapper. The sprint-1 UI is powered by the in-memory services in
 * this folder; when the FastAPI layer exposes these routes, switch the service
 * implementations to `apiFetch` without touching components.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json()
}

/** Simulated network latency so loading states behave like the real API. */
export function delay(value, ms = 120) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms)
  })
}
