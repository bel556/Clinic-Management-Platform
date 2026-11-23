import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellOff, CheckCheck } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  LoadingPane,
  Tabs,
  useToast,
} from '../../../components/common'
import { PageHeader } from '../../../components/layout'
import { NotificationItem } from '../../../components/notification/NotificationItem'
import {
  listNotifications,
  markAllNotificationsRead,
  resolveNotification,
} from '../../../services/notifications'
import { useAsync, useDocumentTitle } from '../../../utils/hooks'
import s from '../reception.module.css'

export default function NotificationsPage() {
  useDocumentTitle('Notifications')
  const navigate = useNavigate()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const { data, loading, reload } = useAsync(() => listNotifications({ filter }), [filter])

  const counts = data?.counts ?? { all: 0, unread: 0, action: 0, completed: 0 }

  const markAll = async () => {
    await markAllNotificationsRead()
    toast.push('All notifications marked as informed.')
    reload()
  }

  const resolve = async (notification) => {
    await resolveNotification(notification.id, notification.actionKind)
    toast.push(
      notification.actionKind === 'handled'
        ? 'Notification marked as handled.'
        : 'Patient marked as informed.',
    )
    reload()
  }

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Reschedules, cancellations, roster alerts and reception handoffs."
        actions={
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAll}>
            Mark all as informed
          </Button>
        }
      />

      <div className={s.toolbar}>
        <Tabs
          tabs={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'unread', label: 'Unread', count: counts.unread },
            { id: 'action', label: 'Action required', count: counts.action },
            { id: 'completed', label: 'Completed', count: counts.completed },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {loading ? <LoadingPane label="Loading notifications…" /> : null}

      {!loading ? (
        <Card padded={false}>
          {data?.rows.length ? (
            data.rows.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onResolve={resolve}
                onDismiss={(item) => {
                  resolve(item)
                }}
                onOpenVisit={(item) => navigate(`/reception/visits/${item.visitId}`)}
              />
            ))
          ) : (
            <EmptyState
              icon={BellOff}
              title="You're all caught up"
              description="No notifications match this filter right now."
            />
          )}
        </Card>
      ) : null}
    </>
  )
}
