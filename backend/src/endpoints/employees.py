from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional
from src.database.connection import get_connection
from src.schemas import DoctorAvailabilityUpdate
from src.services.employee_service import (
    get_employees,
    get_employee,
    set_employee_availability,
)

employee_router = APIRouter()


# return employees optionally filtered by role
@employee_router.get("/employees")
def list_employees(
    role: Optional[str] = Query(None),
    conn=Depends(get_connection),
):
    return get_employees(conn, role=role)


# fetch a single employee record by employee ID
@employee_router.get("/employees/{employee_id}")
def employee_detail(employee_id: int, conn=Depends(get_connection)):
    employee = get_employee(conn, employee_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return employee


# fetch availability details for a single employee by employee ID
@employee_router.get("/employees/{employee_id}/availability")
def employee_availability(employee_id: int, conn=Depends(get_connection)):
    employee = get_employee(conn, employee_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return employee


# update an employee's availability status by employee ID
@employee_router.patch("/employees/{employee_id}/availability")
def update_employee_availability(
    employee_id: int,
    payload: DoctorAvailabilityUpdate,
    conn=Depends(get_connection),
):
    try:
        updated = set_employee_availability(conn, employee_id, payload.status)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )
    return updated