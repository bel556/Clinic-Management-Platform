from src.services.visit_service import (
    create_visit_if_not_exists,
    modify_visit_info,
    cancel_visit,
    get_visit,
    get_consultation,
    get_visit_queue_number,
    search_visits_by_patient,
    search_visits_by_status,
    search_visits_by_date,
    search_visits_by_type,
    get_visit_details_for_doctor,
)
from src.schemas import VisitCreate, VisitModify
from src.database.connection import get_connection
from fastapi import Depends, APIRouter, status, HTTPException, Query
from typing import Optional
from datetime import date

visit_router = APIRouter()


@visit_router.get("/visits/by-patient/{patient_id}")
def visits_by_patient(patient_id: int, conn=Depends(get_connection)):
    visits = search_visits_by_patient(conn, patient_id)
    if visits is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No visits found for this patient",
        )
    return visits


@visit_router.get("/visits/by-status/{visit_status}")
def visits_by_status(
    visit_status: str,
    visit_day: Optional[date] = Query(None),
    conn=Depends(get_connection),
):
    return search_visits_by_status(conn, visit_status, visit_day=visit_day)


@visit_router.get("/visits/by-date/{visit_day}")
def visits_by_date(visit_day: date, conn=Depends(get_connection)):
    return search_visits_by_date(conn, visit_day)


@visit_router.get("/visits/by-type/{visit_type}")
def visits_by_type(visit_type: str, conn=Depends(get_connection)):
    return search_visits_by_type(conn, visit_type)


@visit_router.get("/visits/{visit_id}")
def get_single_visit(visit_id: int, conn=Depends(get_connection)):
    visit = get_visit(conn, visit_id)
    if visit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found",
        )
    return visit


@visit_router.get("/visits/{visit_id}/queue")
def visit_queue_number(visit_id: int, conn=Depends(get_connection)):
    queue_info = get_visit_queue_number(conn, visit_id)
    if queue_info is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found in queue",
        )
    return queue_info


@visit_router.get("/visits/{visit_id}/consultation")
def visit_consultation(visit_id: int, conn=Depends(get_connection)):
    data = get_consultation(conn, visit_id)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found",
        )
    return data


@visit_router.get("/visits/{visit_id}/details")
def visit_details(visit_id: int, doctor_id: int = Query(...), conn=Depends(get_connection)):
    details = get_visit_details_for_doctor(conn, visit_id, doctor_id)
    if details is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found or does not belong to this doctor",
        )
    return details


@visit_router.post("/visits", status_code=status.HTTP_201_CREATED)
def create(visit: VisitCreate, conn=Depends(get_connection)):
    new_visit = create_visit_if_not_exists(
        conn,
        visit.patient_id,
        visit.doctor_id,
        visit.visit_date,
        visit.visit_type,
        status=visit.status,
        financial_status=visit.financial_status,
        reason=visit.reason,
        slot=visit.slot,
    )
    if new_visit is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Visit already exists or failed to create",
        )
    return new_visit


@visit_router.patch("/visits/{visit_id}")
def modify(visit_id: int, visit: VisitModify, conn=Depends(get_connection)):
    updated = modify_visit_info(
        conn,
        visit_id,
        visit_date=visit.visit_date,
        doctor_id=visit.doctor_id,
        visit_type=visit.visit_type,
        status=visit.status,
        financial_status=visit.financial_status,
        reason=visit.reason,
        slot=visit.slot,
    )
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found or update failed",
        )
    return updated


@visit_router.patch("/visits/{visit_id}/cancel")
def cancel(visit_id: int, conn=Depends(get_connection)):
    result = cancel_visit(conn, visit_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found or cancellation failed",
        )
    return result
