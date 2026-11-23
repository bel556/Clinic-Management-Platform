import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  TriangleAlert,
  UserRoundX,
} from 'lucide-react'
import { Button, PriorityBadge } from '../common'
import s from './notification.module.css'

const ICON = {
  action: CircleAlert,
  high: TriangleAlert,
  roster: UserRoundX,
  handled: CheckCircle2,
}

const ICON_CLASS = {
  action: s.iconAction,
  high: s.iconHigh,
  roster: s.iconRoster,
  handled: s.iconHandled,
}

export function NotificationItem({ notification, onResolve, onOpenVisit, onDismiss }) {
  const Icon = ICON[notification.kind] ?? CircleAlert

  return (
    <article className={s.item}>
      <span className={`${s.iconBox} ${ICON_CLASS[notification.kind] ?? s.iconRoster}`}>
        <Icon size={14} />
      </span>

      <div className={s.body}>
        <div className={s.topRow}>
          <PriorityBadge kind={notification.kind} />
          <span className={s.time}>· {notification.timeLabel}</span>
          {!notification.read ? <span className={s.unreadDot} /> : null}
        </div>
        <h3 className={s.title}>{notification.title}</h3>
        {notification.body ? <p className={s.text}>{notification.body}</p> : null}
        {notification.detail?.length ? (
          <div className={s.detail}>
            {notification.detail.map((line) => (
              <p key={line} className={s.detailLine}>
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </div>

      <div className={s.actions}>
        {notification.visitId && onOpenVisit ? (
          <button
            type="button"
            className={s.linkBtn}
            onClick={() => onOpenVisit(notification)}
          >
            <ExternalLink size={10} style={{ verticalAlign: '-1px', marginRight: 3 }} />
            Open Visit
          </button>
        ) : null}
        <div className={s.actionRow}>
          {notification.kind === 'roster' && onDismiss ? (
            <button type="button" className={s.linkBtn} onClick={() => onDismiss(notification)}>
              Dismiss
            </button>
          ) : null}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onResolve?.(notification)}
            disabled={notification.resolved}
          >
            {notification.resolved ? 'Resolved' : notification.actionLabel}
          </Button>
        </div>
      </div>
    </article>
  )
}
