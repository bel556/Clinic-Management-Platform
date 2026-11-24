import { apiFetch } from '../http'
import { toId } from '../config'
import { toNotification } from '../adapters'
import { emitChange } from '../store'

/**
 * The layout reads unread counts synchronously through `useSyncExternalStore`,
 * so the API implementation keeps a cache that is refreshed after every
 * mutation (and once at module load).
 */
let cache = { rows: [], unread: 0, action: 0 }

async function refresh() {
  try {
    const rows = (await apiFetch('/notifications?unread_only=false')) ?? []
    cache = { rows: rows.map(toNotification) }
    cache.unread = cache.rows.filter((row) => !row.read).length
    cache.action = cache.rows.filter(
      (row) => !row.read && (row.kind === 'action' || row.kind === 'high'),
    ).length
    emitChange()
  } catch {
    /* offline / backend down — keep the last known counts */
  }
}

export function refreshNotifications() {
  return refresh()
}

export function unreadCount() {
  return cache.unread
}

export function actionCount() {
  return cache.action
}

export async function listNotifications({ filter = 'all' } = {}) {
  const rows = (await apiFetch('/notifications?unread_only=false')) ?? []
  const all = rows.map(toNotification)
  cache = { rows: all }
  cache.unread = all.filter((row) => !row.read).length
  cache.action = all.filter(
    (row) => !row.read && (row.kind === 'action' || row.kind === 'high'),
  ).length

  const filtered = all.filter((notification) => {
    if (filter === 'unread') return !notification.read
    if (filter === 'action') {
      return !notification.read && (notification.kind === 'action' || notification.kind === 'high')
    }
    if (filter === 'completed') return notification.read
    return true
  })

  return {
    rows: filtered,
    counts: {
      all: all.length,
      unread: all.filter((row) => !row.read).length,
      action: all.filter(
        (row) => !row.read && (row.kind === 'action' || row.kind === 'high'),
      ).length,
      completed: all.filter((row) => row.read).length,
    },
  }
}

export async function markNotificationRead(notificationId) {
  await apiFetch(`/notifications/${encodeURIComponent(toId(notificationId))}/read`, {
    method: 'PATCH',
  })
  await refresh()
  return cache.rows.find((row) => String(row.id) === String(notificationId)) ?? null
}

export async function markAllNotificationsRead() {
  await apiFetch('/notifications/read-all', { method: 'PATCH' })
  await refresh()
  return true
}

export async function resolveNotification(notificationId) {
  await markNotificationRead(notificationId)
  return cache.rows.find((row) => String(row.id) === String(notificationId)) ?? null
}

export async function pushNotification({ message, body, title, visitId }) {
  if (!visitId) return null
  const created = await apiFetch('/notifications', {
    method: 'POST',
    body: { visit_id: toId(visitId), message: message ?? body ?? title ?? 'Visit updated' },
  })
  await refresh()
  return toNotification(created)
}
