import { Link, NavLink } from 'react-router-dom'
import { useSyncExternalStore } from 'react'
import {
  ArrowRightLeft,
  Bell,
  CalendarDays,
  HeartPulse,
  ListOrdered,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react'
import { unreadCount } from '../../services/notifications'
import { subscribe } from '../../services/store'
import s from './layout.module.css'

const ICONS = {
  users: Users,
  calendar: CalendarDays,
  stethoscope: Stethoscope,
  bell: Bell,
  user: UserRound,
  listOrdered: ListOrdered,
}

export function Sidebar({ nav, roleLabel, switchTo, switchLabel }) {
  const unread = useSyncExternalStore(subscribe, unreadCount)

  return (
    <aside className={s.sidebar}>
      <Link to="/" className={s.brand} aria-label="CuraPulse home">
        <span className={s.brandMark}>
          <HeartPulse size={16} strokeWidth={2.3} />
        </span>
        <span className={s.brandName}>CuraPulse</span>
      </Link>

      <p className={s.sectionLabel}>{roleLabel}</p>

      <nav className={s.nav}>
        {nav.map((item) => {
          const Icon = ICONS[item.icon] ?? CalendarDays
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${s.navItem} ${isActive ? s.navItemActive : ''}`
              }
            >
              <span className={s.navIcon}>
                <Icon size={15} strokeWidth={2} />
              </span>
              <span className={s.navLabel}>{item.label}</span>
              {item.badge === 'unread' && unread > 0 ? (
                <span className={s.navBadge}>{unread}</span>
              ) : null}
            </NavLink>
          )
        })}
      </nav>

      <div className={s.sidebarSpacer} />

      {switchTo ? (
        <div className={s.sidebarFoot}>
          <Link to={switchTo} className={s.switchLink}>
            <ArrowRightLeft size={13} />
            <span>{switchLabel}</span>
          </Link>
        </div>
      ) : null}
    </aside>
  )
}
