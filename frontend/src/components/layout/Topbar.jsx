import { Link } from 'react-router-dom'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { Bell, Building2, Clock3, LogOut } from 'lucide-react'
import { Avatar } from '../common'
import { unreadCount } from '../../services/notifications'
import { subscribe } from '../../services/store'
import { CLINIC } from '../../utils/constants'
import { formatStamp, now } from '../../utils/format'
import s from './layout.module.css'

export function Topbar({ user, bellTo, onLogOut, showBell = true, actions }) {
  const unread = useSyncExternalStore(subscribe, unreadCount)
  const [clock, setClock] = useState(() => now())

  useEffect(() => {
    const timer = setInterval(() => setClock(now()), 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className={s.topbar} data-print="hide">
      <div className={s.clinic}>
        <span className={s.clinicIcon}>
          <Building2 size={14} strokeWidth={2.1} />
        </span>
        <span className={s.clinicName}>{CLINIC.name}</span>
      </div>

      <div className={s.clinicMeta}>
        <span className={s.dot} />
        <span>{CLINIC.suite}</span>
        <span className={s.dot} />
        <span className={s.stamp}>
          <Clock3 size={11} />
          {formatStamp(clock)}
        </span>
      </div>

      <div className={s.topRight}>
        {actions}
        {showBell ? (
          <Link
            to={bellTo ?? '/reception/notifications'}
            className={s.bell}
            aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
            title="Notifications"
          >
            <Bell size={15} strokeWidth={2} />
            {unread > 0 ? <span className={s.bellDot}>{unread}</span> : null}
          </Link>
        ) : null}
        <div className={s.userChip}>
          <Avatar name={user.name} size="sm" />
          <div className={s.userMeta}>
            <span className={s.userName}>{user.name}</span>
            <span className={s.userRole}>{user.role}</span>
          </div>
          {onLogOut ? (
            <button type="button" className={s.topAction} onClick={onLogOut} title="Log out">
              <LogOut size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
