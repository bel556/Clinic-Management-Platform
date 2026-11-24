from fastapi import APIRouter, Depends, HTTPException, Query, status
from src.database.connection import get_connection
from src.schemas import NotificationCreate
from src.services import notification_service

notification_router = APIRouter(tags=["Notifications"])


@notification_router.get("/notifications")
def list_notifications(
    unread_only: bool = Query(False),
    conn=Depends(get_connection),
):
    try:
        notifications = notification_service.get_notifications(conn, unread_only=unread_only)
        return notifications
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}",
        )


@notification_router.post("/notifications", status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate,
    conn=Depends(get_connection),
):
    try:
        new_notif = notification_service.create_notification(
            conn, payload.visit_id, payload.message
        )
        return new_notif
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@notification_router.patch("/notifications/{notification_id}/read")
def mark_read(
    notification_id: int,
    conn=Depends(get_connection),
):
    try:
        updated = notification_service.mark_notification_read(conn, notification_id)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        return updated
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@notification_router.patch("/notifications/read-all")
def mark_all_read(conn=Depends(get_connection)):
    try:
        result = notification_service.mark_all_notifications_read(conn)
        return result
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@notification_router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    conn=Depends(get_connection),
):
    try:
        result = notification_service.delete_notification(conn, notification_id)
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        return result
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
