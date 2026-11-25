from src.services.doctor_service import (
    get_doctor_info,
    search_doctors,
    get_doctor_queue,
    get_doctor_visits,
    get_doctor_availability,
    get_doctor_week,
    set_doctor_availability,
)
from src.schemas import DoctorAvailabilityUpdate
from src.database.connection import get_connection
from fastapi import Depends, APIRouter, status, HTTPException, Query
from typing import Optional
from datetime import date

doctor_router = APIRouter()


# search doctors by name, specialty, or current presence status
@doctor_router.get("/doctors/search")
def search(
    name: Optional[str] = Query(None),
    specialty: Optional[str] = Query(None),
    only_present: bool = Query(False),
    conn=Depends(get_connection),
):
    results = search_doctors(
        conn, name=name, specialty=specialty, only_present=only_present
    )
    if results is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch results",
        )
    return results


# fetch a single doctor's profile by doctor ID
@doctor_router.get("/doctors/{doctor_id}")
def get_doctor(doctor_id: int, conn=Depends(get_connection)):
    doctor = get_doctor_info(conn, doctor_id)
    if doctor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return doctor


# return today's queue for a doctor optionally including active consultation details
@doctor_router.get("/doctors/{doctor_id}/queue")
def doctor_queue(
    doctor_id: int,
    include_consultation: bool = Query(False),
    conn=Depends(get_connection),
):
    queue = get_doctor_queue(
        conn, doctor_id, include_consultation=include_consultation
    )
    if queue is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return queue


# return visits for a doctor optionally filtered to a specific day
@doctor_router.get("/doctors/{doctor_id}/visits")
def doctor_visits(
    doctor_id: int,
    visit_day: Optional[date] = Query(None),
    conn=Depends(get_connection),
):
    visits = get_doctor_visits(conn, doctor_id, visit_day=visit_day)
    if visits is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return visits


# return a doctor's weekly schedule and availability between start and end dates
@doctor_router.get("/doctors/{doctor_id}/availability/week")
def doctor_week(
    doctor_id: int,
    start: date = Query(...),
    end: date = Query(...),
    conn=Depends(get_connection),
):
    payload = get_doctor_week(conn, doctor_id, start, end)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return payload


# return a doctor's current availability and queue count
@doctor_router.get("/doctors/{doctor_id}/availability")
def doctor_availability(doctor_id: int, conn=Depends(get_connection)):
    availability = get_doctor_availability(conn, doctor_id)
    if availability is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return availability


# update a doctor's availability status by doctor ID
@doctor_router.patch("/doctors/{doctor_id}/availability")
def update_availability(
    doctor_id: int,
    payload: DoctorAvailabilityUpdate,
    conn=Depends(get_connection),
):
    try:
        updated = set_doctor_availability(conn, doctor_id, payload.status)
        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor not found",
            )
        return updated
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )