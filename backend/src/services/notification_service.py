"""Notification business logic. Timestamps come from NOTIFICATION.created_at."""

from src.repository import notifications as repo
from src.repository import visits as visits_repo


def _clean_str(value):
    if value is None:
        return None
    text = ' '.join(str(value).split())
    return text if text else None


def create_notification(conn, visit_id, message):
    visit = visits_repo.get_visit_by_id(conn, visit_id)
    if visit is None:
        raise LookupError(f'Visit {visit_id} not found')

    cleaned_message = _clean_str(message)
    if not cleaned_message:
        raise ValueError('Notification message cannot be empty')

    new_id = repo.create_notification(conn, visit_id, cleaned_message)
    if new_id is None:
        raise RuntimeError('Failed to create notification')

    return repo.get_notification_by_id(conn, new_id) or {
        'notification_id': new_id,
        'visit_id': visit_id,
        'message': cleaned_message,
        'is_read': False,
    }


def get_notifications(conn, unread_only=False):
    if unread_only:
        return repo.get_unread_notifications(conn) or []
    return repo.get_all_notifications(conn) or []


def mark_notification_read(conn, notification_id):
    existing = repo.get_notification_by_id(conn, notification_id)
    if existing is None:
        return None

    if not existing.get('is_read'):
        if not repo.mark_notification_read(conn, notification_id):
            raise RuntimeError('Failed to mark notification as read')

    return repo.get_notification_by_id(conn, notification_id)


def mark_all_notifications_read(conn):
    unread = repo.get_unread_notifications(conn) or []
    for n in unread:
        if not repo.mark_notification_read(conn, n['notification_id']):
            raise RuntimeError(f"Failed to mark notification {n['notification_id']} as read")

    return {'marked_read': len(unread)}


def delete_notification(conn, notification_id):
    existing = repo.get_notification_by_id(conn, notification_id)
    if existing is None:
        return None

    if not repo.delete_notification(conn, notification_id):
        raise RuntimeError('Failed to delete notification')

    return {'notification_id': notification_id, 'deleted': True}
