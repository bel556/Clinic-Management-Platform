import * as mockImpl from './mock/notifications'
import * as apiImpl from './api/notifications'
import { DEMO_MODE } from './config'

const impl = DEMO_MODE ? mockImpl : apiImpl

export const {
  unreadCount,
  actionCount,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  resolveNotification,
  pushNotification,
} = impl

export const refreshNotifications = impl.refreshNotifications ?? (() => Promise.resolve())
