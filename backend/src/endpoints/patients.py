from src.services.patient_service import (
    create_patient,
    update_patient,
    get_patient_info,
    get_patient_overview,
    get_all_patients,
    get_patient_visits,
    search_patients,
    delete_patient,
    UNSET,
)
from src.schemas import PatientCreate, PatientUpdate
from src.database.connection import get_connection
from fastapi import Depends, APIRouter, status, HTTPException, Query

patient_router = APIRouter()

# return a paginated list of patients ordered by name or recent creation time
@patient_router.get("/patients")
def list_patients(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    order: str = Query('name', pattern='^(name|recent)$'),
    conn=Depends(get_connection),
):
    return get_all_patients(conn, limit=limit, offset=offset, order=order)


# search patients matching the query string
@patient_router.get("/patients/search/{query}")
def search(query: str, conn=Depends(get_connection)):
    results = search_patients(conn, query)
    if results is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch results",
        )
    return results


# return an overview of a patient by patient ID
@patient_router.get("/patients/{patient_id}/overview")
def patient_overview(patient_id: int, conn=Depends(get_connection)):
    data = get_patient_overview(conn, patient_id)
    if data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return data

# fetch a single patient record by patient ID
@patient_router.get("/patients/{patient_id}")
def get_patient(patient_id: int, conn=Depends(get_connection)):
    patient = get_patient_info(conn, patient_id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return patient

# return visits for a patient by patient ID
@patient_router.get("/patients/{patient_id}/visits")
def patient_visits(patient_id: int, conn=Depends(get_connection)):
    visits = get_patient_visits(conn, patient_id)
    if visits is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return visits

# create a new patient record
@patient_router.post("/patients", status_code=status.HTTP_201_CREATED)
def create(patient: PatientCreate, conn=Depends(get_connection)):
    try:
        new_patient = create_patient(
            conn,
            patient.first_name,
            patient.last_name,
            patient.birth_date,
            patient.phone,
            patient.gender,
            email=patient.email,
            additional_info=patient.additional_info,
            emergency_contact=patient.emergency_contact,
            blood_type=patient.blood_type,
            allergies=patient.allergies,
            conditions=patient.conditions,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create patient",
        )
    return new_patient

# update an existing patient record by patient ID
@patient_router.patch("/patients/{patient_id}")
def update(patient_id: int, patient: PatientUpdate, conn=Depends(get_connection)):
    try:
        updated = update_patient(
            conn,
            patient_id,
            first_name=patient.first_name if patient.first_name is not None else UNSET,
            last_name=patient.last_name if patient.last_name is not None else UNSET,
            birth_date=patient.birth_date if patient.birth_date is not None else UNSET,
            phone=patient.phone if patient.phone is not None else UNSET,
            email=patient.email if patient.email is not None else UNSET,
            gender=patient.gender if patient.gender is not None else UNSET,
            additional_info=patient.additional_info
            if patient.additional_info is not None
            else UNSET,
            emergency_contact=patient.emergency_contact
            if patient.emergency_contact is not None
            else UNSET,
            blood_type=patient.blood_type if patient.blood_type is not None else UNSET,
            allergies=patient.allergies if patient.allergies is not None else UNSET,
            conditions=patient.conditions if patient.conditions is not None else UNSET,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update patient",
        )
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return updated

# delete a patient record by patient ID
@patient_router.delete("/patients/{patient_id}")
def delete(patient_id: int, conn=Depends(get_connection)):
    try:
        result = delete_patient(conn, patient_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete patient",
        )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return result