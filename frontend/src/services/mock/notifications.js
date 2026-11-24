import { db } from '../mockDb'
import { delay } from '../http'
import { emitChange } from '../store'
import { formatDateShort, formatTime } from '../../utils/format'
import { getPatientRecord, patientFullName } from '../model'

function decorate(notification) {
  const patient = notification.patientId
    ? getPatientRecord(notification.patientId)
    : null

  return {
    ...notification,
    patientName: patient ? patientFullName(patient) : null,
    timeLabel: `${formatDateShort(notification.time)} · ${formatTime(notification.time)}`,
  }
}

export function unreadCount() {
  return db().notifications.filter((notification) => !notification.read).length
}

export function actionCount() {
  return db().notifications.filter(
    (notification) => !notification.read && notification.kind !== 'roster',
  ).length
}

export async function listNotifications({ filter = 'all' } = {}) {
  const all = db().notifications.map(decorate)

  const filtered = all.filter((notification) => {
    if (filter === 'unread') return !notification.read
    if (filter === 'action') {
      return (
        !notification.read &&
        (notification.kind === 'action' || notification.kind === 'high')
      )
    }
    if (filter === 'completed') return notification.read || notification.kind === 'handled'
    return true
  })

  return delay({
    rows: filtered,
    counts: {
      all: all.length,
      unread: all.filter((notification) => !notification.read).length,
      action: all.filter(
        (notification) =>
          !notification.read &&
          (notification.kind === 'action' || notification.kind === 'high'),
      ).length,
      completed: all.filter(
        (notification) => notification.read || notification.kind === 'handled',
      ).length,
    },
  })
}

export async function markNotificationRead(notificationId) {
  const notification = db().notifications.find(
    (item) => item.id === notificationId,
  )
  if (!notification) throw new Error('Notification not found')
  notification.read = true
  emitChange()
  return delay(decorate(notification))
}

export async function markAllNotificationsRead() {
  db().notifications.forEach((notification) => {
    notification.read = true
  })
  emitChange()
  return delay(true)
}

export async function resolveNotification(notificationId, actionKind) {
  const notification = db().notifications.find(
    (item) => item.id === notificationId,
  )
  if (!notification) throw new Error('Notification not found')

  notification.read = true
  notification.resolved = true

  if (actionKind === 'handled') {
    notification.kind = 'handled'
    notification.title = notification.title.replace(/^High priority · /, '')
  }

  emitChange()
  return delay(decorate(notification))
}

export function pushNotification({ title, body, kind = 'action', patientId, visitId, detail = [] }) {
  const notification = {
    id: `NT-${String(db().notifications.length + 1).padStart(2, '0')}`,
    kind,
    title,
    body,
    time: new Date().toISOString(),
    patientId: patientId ?? null,
    visitId: visitId ?? null,
    detail,
    actionLabel: 'Mark patient informed',
    actionKind: 'inform',
    read: false,
  }
  db().notifications.unshift(notification)
  emitChange()
  return notification
}
